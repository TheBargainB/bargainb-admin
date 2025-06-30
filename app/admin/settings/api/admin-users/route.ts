import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - List all admin users
export async function GET() {
  try {
    console.log('🔍 Fetching admin users with admin client...')
    
    // Use admin client for proper permissions
    const { data: adminUsers, error } = await supabaseAdmin
      .from('admin_users')
      .select(`
        id,
        email,
        role,
        permissions,
        is_active,
        created_at,
        updated_at,
        auth_user_id
      `)
      .order('created_at', { ascending: false })

    console.log('📊 Query result:', { 
      usersCount: adminUsers?.length || 0, 
      error: error?.message || 'none' 
    })

    if (error) {
      console.error('Error fetching admin users:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Get the auth user data for each admin user
    if (adminUsers && adminUsers.length > 0) {
      for (const adminUser of adminUsers) {
        if (adminUser.auth_user_id) {
          try {
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(adminUser.auth_user_id)
            if (authUser.user) {
              (adminUser as any).auth_users = {
                email: authUser.user.email,
                user_metadata: authUser.user.user_metadata || {
                  full_name: authUser.user.email?.split('@')[0] || 'Admin User',
                  username: authUser.user.email?.split('@')[0] || 'admin'
                }
              }
            }
          } catch (authError) {
            console.warn(`Could not fetch auth data for user ${adminUser.email}:`, authError)
            // Create fallback auth_users data
            ;(adminUser as any).auth_users = {
              email: adminUser.email,
              user_metadata: {
                full_name: adminUser.email.split('@')[0], // Fallback name
                username: adminUser.email.split('@')[0]
              }
            }
          }
        } else {
          // No auth_user_id, create basic fallback
          ;(adminUser as any).auth_users = {
            email: adminUser.email,
            user_metadata: {
              full_name: adminUser.email.split('@')[0],
              username: adminUser.email.split('@')[0]
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { users: adminUsers || [] }
    })

  } catch (error) {
    console.error('Error in GET /admin/settings/api/admin-users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
  try {

    const body = await request.json()
    const {
      fullName,
      username,
      email,
      role = 'admin',
      department,
      password,
      permissions = {},
      sendWelcomeEmail = true,
      requirePasswordChange = true,
      enableTwoFA = false
    } = body

    if (!email || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Email and full name are required' },
        { status: 400 }
      )
    }

    // Step 0: Check if user already exists in admin_users table
    const { data: existingAdminUser, error: adminCheckError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, auth_user_id')
      .eq('email', email.toLowerCase())
      .single()

    if (adminCheckError && adminCheckError.code !== 'PGRST116') {
      console.error('Error checking existing admin user:', adminCheckError)
      return NextResponse.json(
        { success: false, error: 'Failed to check existing admin user' },
        { status: 500 }
      )
    }

    if (existingAdminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user with this email already exists in admin table' },
        { status: 400 }
      )
    }

    // Step 0.5: Check if auth user exists but has no admin record (orphaned user)
    let existingAuthUser = null
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
      existingAuthUser = authUsers.users?.find(user => user.email?.toLowerCase() === email.toLowerCase())
    } catch (authListError) {
      console.warn('Could not list auth users:', authListError)
    }

    // Step 1: Create or use existing auth user
    let authUser: any
    let authError: any

    if (existingAuthUser) {
      // Use existing orphaned auth user
      console.log(`📧 Found orphaned auth user for ${email}, reusing auth user ID: ${existingAuthUser.id}`)
      authUser = { user: existingAuthUser }
      authError = null

      // Update the auth user metadata if needed
      try {
        await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
          user_metadata: {
            full_name: fullName,
            username: username || email.split('@')[0],
            department: department,
            role: role,
            require_password_change: requirePasswordChange,
            enable_two_fa: enableTwoFA
          }
        })
        console.log('✅ Updated existing auth user metadata')
      } catch (updateError) {
        console.warn('⚠️ Could not update auth user metadata:', updateError)
      }
    } else {
      // Create new auth user
      if (password && password.trim()) {
        // Create user with password
        const authPayload = {
          email: email.toLowerCase(),
          password: password,
          email_confirm: true, // Always auto-confirm when password is provided
          user_metadata: {
            full_name: fullName,
            username: username || email.split('@')[0],
            department: department,
            role: role,
            require_password_change: requirePasswordChange,
            enable_two_fa: enableTwoFA
          }
        }

        const result = await supabaseAdmin.auth.admin.createUser(authPayload)
        authUser = result.data
        authError = result.error
      } else {
        // Send invitation email (user will set password later)
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          email.toLowerCase(),
          {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/login`,
            data: {
              full_name: fullName,
              username: username || email.split('@')[0],
              department: department,
              role: role,
              require_password_change: requirePasswordChange,
              enable_two_fa: enableTwoFA
            }
          }
        )
        
        authUser = inviteData
        authError = inviteError
      }

      if (authError) {
        console.error('Error creating auth user:', authError)
        return NextResponse.json(
          { success: false, error: `Failed to create user account: ${authError.message}` },
          { status: 400 }
        )
      }
    }

    if (!authUser.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user account' },
        { status: 400 }
      )
    }

    // Step 2: Create admin user record
    const userId = authUser.user?.id || authUser.id
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        auth_user_id: userId,
        email: email.toLowerCase(),
        role: role,
        permissions: permissions,
        is_active: true
      })
      .select()
      .single()

    if (adminError) {
      // If admin user creation fails, clean up auth user (only if we created it)
      console.error('Error creating admin user record:', adminError)
      
      if (!existingAuthUser) {
        // Only delete auth user if we created it in this request
        try {
          const userId = authUser.user?.id || authUser.id
          if (userId) {
            await supabaseAdmin.auth.admin.deleteUser(userId)
          }
        } catch (cleanupError) {
          console.error('Error cleaning up auth user:', cleanupError)
        }
      }

      return NextResponse.json(
        { success: false, error: `Failed to create admin record: ${adminError.message}` },
        { status: 500 }
      )
    }

    // Step 3: Optionally create chat user for admin panel access
    // NOTE: Removed - we no longer use the chat_users table in the new CRM system
    // All chat functionality now uses whatsapp_contacts + conversations + messages tables

    const successMessage = existingAuthUser 
      ? 'Admin user created successfully using existing auth account'
      : (password && password.trim()) 
        ? 'Admin user created successfully' 
        : 'Admin user created and invitation email sent'

    return NextResponse.json({
      success: true,
      data: { 
        user: adminUser,
        message: successMessage
      }
    })

  } catch (error) {
    console.error('Error in POST /admin/settings/api/admin-users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 