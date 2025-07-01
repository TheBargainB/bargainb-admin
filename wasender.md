How To Receive Messages From Wasenderapi (Processing Webhook Event: messages.upsert)
Getting Started

A developer's guide to receiving and processing real-time message events from the WASenderAPI. This documentation details the JSON payload for the messages.upsert event, covering text messages, media handling, and the required media decryption process.

How to Handle Incoming WhatsApp Messages
When you get a new WhatsApp message, we send a POST request to your server. This is called a webhook. Inside is a JSON payload with all the message details. This guide shows you how to read it.

The Message Payload
The JSON we send looks like this. Everything you need is inside data.messages.

{
  "data": {
    "messages": [
      {
        "key": {
          "remoteJid": "1234567890@s.whatsapp.net",
          "fromMe": false,
          "id": "BAE5A93B52084A3B"
        },
        "message": {
          "conversation": "Hello! This is a test."
        },
        "pushName": "John Doe",
        "messageTimestamp": 1678886400
      }
    ]
  }
}
Key Things to Look For:
key.remoteJid: The customer's phone number (with @s.whatsapp.net at the end).
key.fromMe: Is false if the customer sent it. Is true if you sent it.
key.id: The unique ID for this message. Use it to avoid saving the same message twice.
pushName: The customer's WhatsApp name. Useful if you don't know them.
message: This object holds the actual message content. This is the most important part.
Reading the Message Content
Look inside the message object to see what kind of message it is.

1. Text Messages
The message text can be in two different places. Always check for message.extendedTextMessage.text first. If it's not there, then check for message.conversation.

Example: Text in extendedTextMessage (like a reply or message with a link)
"message": {
  "extendedTextMessage": {
    "text": "This is the message text."
  }
}
Example: Text in conversation (a very simple message)
"message": {
  "conversation": "Hello!"
}
2. Media Messages (Images, Videos, etc.)
If it's a media message, the message object will contain a key like imageMessage, videoMessage, or audioMessage.

"message": {
  "imageMessage": {
    "url": "https://some-url-to-the-file.net/...",
    "mediaKey": "aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890aBcD=",
    "mimetype": "image/jpeg"
  }
}
To get the media file, you need two things from here:

url: The link to download the file.
mediaKey: The key to unlock (decrypt) the file after you download it.
How to Decrypt Media Files
The media files you download are encrypted. You must decrypt them to view them.

Heads Up: This part is tricky and requires programming with cryptography.

Don't worry! We provide a complete code example below that handles everything, including decryption. You can just copy it.

For context, here is the simple process the code follows:

Download the file from the url.
Unlock the file using the mediaKey.
Things to Remember
Check if the message has content
Sometimes you'll get a webhook for an empty event (like a "message deleted" notification). If message doesn't have conversation, extendedTextMessage, or imageMessage etc., you can just ignore it. Our example code handles this.

Get the phone number
Just take the remoteJid and remove the "@s.whatsapp.net" part to get the simple phone number. Our example code handles this too.

Code Examples
php
javascript
python
n8n code
n8n full workflow

<?php

declare(strict_types=1);

// The directory to save downloaded media files.
// Make sure this directory exists and your web server can write to it.
define('DOWNLOAD_DIR', __DIR__ . '/downloads');

/**
 * A simple logging function for demonstration.
 * In a real application, you would use a proper logger like Monolog.
 */
function logMessage(string $message): void
{
    // Prepend a timestamp to the log message.
    $timestamp = date('Y-m-d H:i:s');
    // Append the message to a log file.
    file_put_contents('webhook.log', "[$timestamp] $message\n", FILE_APPEND);
}

/**
 * Finds the first available media object and its type from the message.
 * @return array|null [media_object, media_type_string] or null if not found.
 */
function findMediaInfo(array $messageObject): ?array
{
    $mediaKeys = [
        'imageMessage'    => 'image',
        'videoMessage'    => 'video',
        'audioMessage'    => 'audio',
        'documentMessage' => 'document',
        'stickerMessage'  => 'sticker',
    ];

    foreach ($mediaKeys as $key => $type) {
        if (isset($messageObject[$key])) {
            return [$messageObject[$key], $type];
        }
    }
    return null;
}

/**
 * Downloads a file from a URL.
 * @return string|false The file content or false on failure.
 */
function downloadFile(string $url)
{
    $context = stream_context_create(['http' => ['follow_location' => true]]);
    return file_get_contents($url, false, $context);
}

/**
 * Derives the decryption keys using HKDF.
 * @throws Exception If media type is invalid.
 */
function getDecryptionKeys(string $mediaKey, string $mediaType): string
{
    // The "info" string is specific to each WhatsApp media type.
    $info = match ($mediaType) {
        'image', 'sticker' => 'WhatsApp Image Keys',
        'video'           => 'WhatsApp Video Keys',
        'audio'           => 'WhatsApp Audio Keys',
        'document'        => 'WhatsApp Document Keys',
        default           => throw new Exception("Invalid media type: {$mediaType}"),
    };
    
    // Use HKDF to derive a 112-byte expanded key.
    return hash_hkdf('sha256', base64_decode($mediaKey), 112, $info, '');
}

/**
 * Main function to decrypt and save a media file.
 * @throws Exception On failure to download or decrypt.
 */
function handleMediaDecryption(array $mediaInfo, string $mediaType, string $messageId): void
{
    $url = $mediaInfo['url'] ?? null;
    $mediaKey = $mediaInfo['mediaKey'] ?? null;
    
    if (!$url || !$mediaKey) {
        throw new Exception("Media object is missing 'url' or 'mediaKey'.");
    }

    // 1. Download the encrypted file
    $encryptedData = downloadFile($url);
    if (!$encryptedData) {
        throw new Exception("Failed to download media from URL: {$url}");
    }

    // 2. Derive the IV and Cipher Key from the mediaKey
    $keys = getDecryptionKeys($mediaKey, $mediaType);
    $iv = substr($keys, 0, 16);
    $cipherKey = substr($keys, 16, 32);

    // 3. The actual ciphertext is the file content, minus the last 10 bytes (which are a MAC hash).
    $ciphertext = substr($encryptedData, 0, -10);

    // 4. Decrypt using AES-256-CBC
    $decryptedData = openssl_decrypt($ciphertext, 'aes-256-cbc', $cipherKey, OPENSSL_RAW_DATA, $iv);

    if ($decryptedData === false) {
        throw new Exception('Failed to decrypt media.');
    }

    // 5. Save the decrypted file
    if (!is_dir(DOWNLOAD_DIR)) {
        mkdir(DOWNLOAD_DIR, 0755, true);
    }
    $mimeType = $mediaInfo['mimetype'] ?? 'application/octet-stream';
    $extension = explode('/', $mimeType)[1] ?? 'bin';
    $filename = $mediaInfo['fileName'] ?? "{$messageId}.{$extension}";
    $outputPath = DOWNLOAD_DIR . '/' . basename($filename); // Use basename to prevent path traversal
    
    file_put_contents($outputPath, $decryptedData);
    logMessage("Successfully decrypted and saved media to: {$outputPath}");
}


// --- MAIN WEBHOOK PROCESSING LOGIC ---

// 1. Get the incoming JSON payload from the POST request
$jsonPayload = file_get_contents('php://input');
$payload = json_decode($jsonPayload, true);

// 2. Extract the first message from the payload
$messageData = $payload['data']['messages'][0] ?? null;
if (!$messageData) {
    logMessage('Webhook received but no message data found.');
    http_response_code(200); // Respond OK to prevent retries
    exit();
}

$key = $messageData['key'] ?? [];
$messageId = $key['id'] ?? 'unknown_id';
$remoteJid = $key['remoteJid'] ?? null;

if (!$remoteJid) {
    logMessage('Ignoring message with no remoteJid.');
    http_response_code(200);
    exit();
}

// 3. Extract basic message info
$pushName = !($key['fromMe'] ?? false) ? ($messageData['pushName'] ?? 'Unknown') : 'Me';
$phoneNumber = preg_replace('/@.*/', '', $remoteJid);
$messageContent = $messageData['message']['conversation'] ?? $messageData['message']['extendedTextMessage']['text'] ?? null;
$mediaInfo = findMediaInfo($messageData['message'] ?? []);

// 4. If there's no text and no media, ignore the message
if (empty($messageContent) && !$mediaInfo) {
    logMessage("Ignoring event with no content (ID: {$messageId})");
    http_response_code(200);
    exit();
}

// 5. Process the message
logMessage("Processing message from {$pushName} ({$phoneNumber}). ID: {$messageId}");

if ($messageContent) {
    logMessage("Text: {$messageContent}");
    // TODO: Save text message to your database here.
}

if ($mediaInfo) {
    try {
        logMessage("Media found. Type: {$mediaInfo[1]}. Attempting to decrypt...");
        handleMediaDecryption($mediaInfo[0], $mediaInfo[1], $messageId);
        // TODO: Save media file path to your database here.
    } catch (Exception $e) {
        logMessage("ERROR processing media for message ID {$messageId}: " . $e->getMessage());
    }
}

// 6. Send a 200 OK response to the API
http_response_code(200);
logMessage("--- Finished processing webhook ---");

Webhook Setup
Webhooks

POST
/your-webhook-url
How to set up and verify webhooks to receive real-time events.

Webhook Setup
Webhooks allow your application to receive real-time notifications about events happening in your WhatsApp session, such as receiving messages, message status updates, or session status changes.

Configuration:
Go to your WhatsApp Session settings in the Wasender dashboard.
Enter your publicly accessible webhook URL in the 'Webhook URL' field. This URL must be HTTPS.
Optionally, generate and save a 'Webhook Secret'. This secret is used to verify that incoming requests are genuinely from Wasender.
Enable the specific events you want to subscribe to.
Save your changes.
Verification:
It's crucial to verify that incoming webhook requests originate from Wasender. Check if the X-Webhook-Signature header in the request matches your stored Webhook Secret.

Always respond to webhook requests with a 200 OK status code quickly to acknowledge receipt, even if you process the event asynchronously.

Parameters
Name	Type	Required	Description
X-Webhook-Signature	string	Yes	Secret key used to verify the webhook came from WasenderApi.
Content-Type	string	Yes	Should be `application/json`.
Code Examples
javascript

// Example webhook endpoint in Express.js
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Verify webhook signature to ensure it's from WasenderApi
function verifySignature(req) {
    const signature = req.headers['x-webhook-signature'];
    const webhookSecret = 'YOUR_WEBHOOK_SECRET'; // Store securely
    if (!signature || !webhookSecret || signature !== webhookSecret) return false;
    return true;
}

app.post('/webhook', (req, res) => {
    if (!verifySignature(req)) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = req.body;
    console.log('Received webhook event:', payload.event);

    // Handle different event types (e.g., message.sent, session.status)
    switch (payload.event) {
        case 'messages.upsert':
            console.log('New message received:', payload.data.key.id);
            // Process the incoming message
            break;
        // Add other cases
    }

    res.status(200).json({ received: true });
});

app.listen(3000, () => {
    console.log('Webhook server listening on port 3000');
});

Send Text Message
Messages

POST
/api/send-message
Sends a plain text message to a recipient.

Send Basic Text Messages
Use this endpoint to send basic text messages. You can specify a single recipient phone number (E.164 format) .

Parameters
Name	Type	Required	Description
to	string	Yes	Recipient phone number in E.164 format or, Group JID, or Community Channel JID.
text	string	Yes	The text content of the message. Required if no media/contact/location is sent.
imageUrl	string	No	URL of the image to send.
videoUrl	string	No	URL of the video to send.
documentUrl	string	No	URL of the document to send.
audioUrl	string	No	URL of the audio file to send (sent as voice note).
stickerUrl	string	No	URL of the sticker (.webp) to send.
contact	object	No	Contact card object.
location	object	No	Location object.
Code Examples
bash
python
javascript
php
ruby
go
csharp
java
swift
powershell
typescript
rust

curl -X POST "https://www.wasenderapi.com/api/send-message" 
  -H "Authorization: Bearer YOUR_API_KEY" 
  -H "Content-Type: application/json" 
  -d '{
    "to": "+1234567890",
    "text": "Hello, this is your requested update."
}'
Response Examples
Success Response

{
  "success": true,
  "data": {
    "msgId": 100000,
    "jid": "+123456789",
    "status": "in_progress"
  }
}