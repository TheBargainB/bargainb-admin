// import FooterSection from '@/components/footer';
// import ScrollToTop from '@/components/scroll-to-top';
import { BargainBLogo } from '@/components/bargainb-logo';
import Footer from '@/components/footer';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';

export default function PrivacyPolicy() {
    const sections = [
        {
            title: 'Introductie',
            content: (
                <>
                    The BargainB (“wij”, “ons” of “onze”) beheert
                    https://thebargainb.com/ en de mobiele applicatie van The
                    BargainB (hierna aangeduid als de “Dienst”). Ons
                    privacybeleid is van toepassing op uw bezoek aan
                    https://thebargainb.com/ en het gebruik van de mobiele
                    applicatie van The BargainB. Het legt uit hoe wij informatie
                    verzamelen, beveiligen en openbaar maken die voortkomt uit
                    uw gebruik van onze Dienst. Wij gebruiken uw gegevens om de
                    Dienst te leveren en te verbeteren. Door gebruik te maken
                    van de Dienst gaat u akkoord met het verzamelen en gebruiken
                    van informatie in overeenstemming met dit beleid. Tenzij
                    anders gedefinieerd in dit privacybeleid, hebben de termen
                    die hierin worden gebruikt dezelfde betekenis als in onze
                    Algemene Voorwaarden. Onze Algemene Voorwaarden
                    (“Voorwaarden”) zijn van toepassing op al het gebruik van
                    onze Dienst en vormen samen met het privacybeleid uw
                    overeenkomst met ons (“overeenkomst”).
                </>
            ),
        },
        {
            title: 'Definities',
            content: (
                <>
                    DIENST betekent de website https://thebargainb.com/ en de
                    mobiele applicatie van The BargainB die wordt beheerd door
                    The BargainB. PERSOONSGEGEVENS betekent gegevens over een
                    levende persoon die kan worden geïdentificeerd aan de hand
                    van die gegevens (of aan de hand van die gegevens en andere
                    informatie die bij ons berust of waarschijnlijk bij ons zal
                    berusten). GEBRUIKSGEGEVENS zijn gegevens die automatisch
                    worden verzameld, gegenereerd door het gebruik van de Dienst
                    of vanuit de infrastructuur van de Dienst zelf (bijvoorbeeld
                    de duur van een paginaweergave). COOKIES zijn kleine
                    bestanden die op uw apparaat (computer of mobiel apparaat)
                    worden opgeslagen. GEGEVENSVERANTWOORDELIJKE betekent een
                    natuurlijke of rechtspersoon die (alleen of gezamenlijk met
                    anderen) het doel en de middelen voor de verwerking van
                    persoonsgegevens bepaalt. Voor de toepassing van dit
                    privacybeleid zijn wij de Gegevensverantwoordelijke van uw
                    gegevens. GEGEVENSVERWERKERS (OF DIENSTVERLENERS) betekent
                    elke natuurlijke of rechtspersoon die gegevens verwerkt
                    namens de Gegevensverantwoordelijke. Wij kunnen gebruik
                    maken van de diensten van verschillende Dienstverleners om
                    uw gegevens effectiever te verwerken. BETROKKENE is elke
                    levende persoon op wie de Persoonsgegevens betrekking
                    hebben. DE GEBRUIKER is de persoon die onze Dienst gebruikt.
                    De Gebruiker komt overeen met de Betrokkene, die het
                    onderwerp van de Persoonsgegevens is.
                </>
            ),
        },
        {
            title: 'Verzameling & Gebruik',
            content: (
                <>
                    Wij verzamelen verschillende soorten informatie voor diverse
                    doeleinden om onze Dienst aan u te kunnen leveren en
                    verbeteren.
                </>
            ),
        },
        {
            title: 'Soorten Gegevens die Wij Verzamelen',
            content: (
                <>
                    <strong>Persoonsgegevens</strong>
                    <br />
                    Tijdens het gebruik van onze Dienst kunnen wij u vragen om
                    bepaalde persoonlijk identificeerbare informatie te
                    verstrekken die kan worden gebruikt om contact met u op te
                    nemen of om u te identificeren (“Persoonsgegevens”).
                    Persoonlijk identificeerbare informatie kan onder meer
                    omvatten, maar is niet beperkt tot:
                    <ol className='list-[lower-alpha] pl-8 py-2'>
                        <li>E-mailadres</li>
                        <li>Voornaam en achternaam</li>
                        <li>Telefoonnummer</li>
                        <li>Cookies en Gebruiksgegevens</li>
                    </ol>
                    <p>
                        Wij kunnen uw Persoonsgegevens gebruiken om contact met
                        u op te nemen via nieuwsbrieven, marketing- of
                        promotionele materialen en andere informatie die voor u
                        interessant kan zijn. U kunt zich afmelden voor het
                        ontvangen van deze communicatie van ons door een e-mail
                        te sturen naar support@thebargainb.com.
                    </p>
                    <div className='flex flex-col gap-2 mt-4'>
                        <p>
                            <strong>Gebruiksgegevens</strong>
                        </p>
                        <p>
                            Wij kunnen ook informatie verzamelen die uw browser
                            verzendt telkens wanneer u onze Dienst bezoekt of
                            wanneer u toegang krijgt tot de Dienst via een
                            mobiel apparaat (“Gebruiksgegevens”). Deze
                            Gebruiksgegevens kunnen informatie bevatten zoals
                            het IP-adres van uw computer, browsertype,
                            browserversie, de pagina’s van onze Dienst die u
                            bezoekt, de datum en tijd van uw bezoek, de tijd die
                            op die pagina’s is doorgebracht, unieke
                            apparaatidentificaties en andere diagnostische
                            gegevens.
                        </p>
                        <p>
                            Wanneer u toegang krijgt tot de Dienst via een
                            mobiel apparaat, kunnen deze Gebruiksgegevens
                            informatie bevatten zoals het type mobiel apparaat
                            dat u gebruikt, uw unieke ID van het mobiele
                            apparaat, het IP-adres van uw mobiele apparaat, uw
                            mobiel besturingssysteem, het type mobiele
                            internetbrowser dat u gebruikt, unieke apparaat-ID’s
                            en andere diagnostische gegevens.
                        </p>
                        <p>
                            <strong>Locatiegegevens</strong>
                        </p>
                        <p>
                            Wij kunnen informatie over uw locatie gebruiken en
                            opslaan als u ons toestemming geeft om dit te doen
                            (“Locatiegegevens”). Wij gebruiken deze gegevens om
                            functies van onze Dienst aan te bieden, en om deze
                            te verbeteren en te personaliseren. U kunt de
                            locatievoorzieningen in- of uitschakelen via de
                            instellingen van uw apparaat.
                        </p>
                        <p>
                            <strong>Tracking Cookies Gegevens</strong>
                        </p>
                        <p>
                            Wij gebruiken cookies en vergelijkbare
                            trackingtechnologieën om de activiteit op onze
                            Dienst te volgen en bepaalde informatie op te slaan.
                            Cookies zijn bestanden met een kleine hoeveelheid
                            gegevens die een anonieme unieke identificatie
                            kunnen bevatten. Cookies worden naar uw browser
                            verzonden vanaf een website en op uw apparaat
                            opgeslagen. Andere trackingtechnologieën die ook
                            worden gebruikt zijn bakens, tags en scripts om
                            informatie te verzamelen, te volgen en onze Dienst
                            te verbeteren en analyseren. U kunt uw browser
                            opdracht geven om alle cookies te weigeren of aan te
                            geven wanneer een cookie wordt verzonden. Als u
                            echter geen cookies accepteert, is het mogelijk dat
                            u sommige delen van onze Dienst niet kunt gebruiken.
                        </p>
                        <p>
                            <strong>
                                Voorbeelden van cookies die wij gebruiken:
                            </strong>
                        </p>
                    </div>
                    <ol className='list-[lower-alpha] pl-8 py-2'>
                        <li>
                            Sessiecookies: wij gebruiken sessiecookies om onze
                            Dienst te laten functioneren.
                        </li>
                        <li>
                            Voorkeurscookies: wij gebruiken voorkeurscookies om
                            uw voorkeuren en diverse instellingen te onthouden.
                        </li>
                        <li>
                            Beveiligingscookies: wij gebruiken
                            beveiligingscookies voor beveiligingsdoeleinden.
                        </li>
                        <li>
                            Advertentiecookies: deze worden gebruikt om u
                            advertenties te tonen die relevant zijn voor u en uw
                            interesses.
                        </li>
                    </ol>
                </>
            ),
        },
        {
            title: 'Gebruik van Gegevens',
            content: (
                <>
                    <p>
                        The BargainB gebruikt de verzamelde gegevens voor
                        diverse doeleinden:
                    </p>
                    <ol className='list-[lower-alpha] pl-8 py-2'>
                        <li>om onze Dienst te leveren en te onderhouden;</li>
                        <li>
                            om u op de hoogte te stellen van wijzigingen in onze
                            Dienst;
                        </li>
                        <li>
                            om u in staat te stellen deel te nemen aan
                            interactieve functies van onze Dienst wanneer u
                            daarvoor kiest;
                        </li>
                        <li>om klantenondersteuning te bieden;</li>
                        <li>
                            om analyses of waardevolle informatie te verzamelen
                            zodat wij onze Dienst kunnen verbeteren;
                        </li>
                        <li>om het gebruik van onze Dienst te monitoren;</li>
                        <li>
                            om technische problemen te detecteren, te voorkomen
                            en aan te pakken;
                        </li>
                        <li>
                            om enig ander doel te vervullen waarvoor u de
                            informatie verstrekt;
                        </li>
                        <li>
                            om onze verplichtingen na te komen en onze rechten
                            af te dwingen die voortvloeien uit contracten tussen
                            u en ons, inclusief voor facturering en incasso;
                        </li>
                        <li>
                            om u meldingen te sturen met betrekking tot uw
                            account en/of abonnement, inclusief meldingen over
                            vervaldatums en verlengingen, e-mailinstructies,
                            enz.;
                        </li>
                        <li>
                            om u nieuws, speciale aanbiedingen en algemene
                            informatie te bieden over andere goederen, diensten
                            en evenementen die wij aanbieden en die
                            vergelijkbaar zijn met wat u al hebt gekocht of waar
                            u naar hebt geïnformeerd, tenzij u ervoor hebt
                            gekozen dergelijke informatie niet te ontvangen;
                        </li>
                        <li>
                            op elke andere manier die wij beschrijven wanneer u
                            de informatie verstrekt;
                        </li>
                        <li>voor elk ander doel met uw toestemming.</li>
                    </ol>
                </>
            ),
        },
        {
            title: 'Bewaring van Gegevens',
            content: (
                <>
                    Wij bewaren uw Persoonsgegevens alleen zolang als nodig is
                    voor de doeleinden die in dit privacybeleid zijn
                    uiteengezet. Wij bewaren en gebruiken uw Persoonsgegevens
                    voor zover dat nodig is om te voldoen aan onze wettelijke
                    verplichtingen (bijvoorbeeld als wij uw gegevens moeten
                    bewaren om te voldoen aan toepasselijke wetgeving),
                    geschillen op te lossen en onze wettelijke overeenkomsten en
                    beleidsregels af te dwingen. Wij bewaren Gebruiksgegevens
                    ook voor interne analyse. Gebruiksgegevens worden over het
                    algemeen voor een kortere periode bewaard, tenzij deze
                    gegevens worden gebruikt om de veiligheid te versterken of
                    om de functionaliteit van onze Dienst te verbeteren, of als
                    wij wettelijk verplicht zijn deze gegevens voor langere tijd
                    te bewaren.
                </>
            ),
        },
        {
            title: 'Overdracht van Gegevens',
            content: (
                <>
                    Uw informatie, inclusief Persoonsgegevens, kan worden
                    overgedragen naar – en bewaard op – computers die zich
                    bevinden buiten uw staat, provincie, land of andere
                    overheidsjurisdictie waar de wetgeving inzake
                    gegevensbescherming kan verschillen van die in uw
                    rechtsgebied. Als u zich buiten de Verenigde Staten bevindt
                    en ervoor kiest om informatie aan ons te verstrekken, houd
                    er dan rekening mee dat wij de gegevens, inclusief
                    Persoonsgegevens, overdragen naar de Verenigde Staten en
                    daar verwerken. Uw instemming met dit privacybeleid, gevolgd
                    door uw verstrekking van dergelijke informatie, houdt in dat
                    u akkoord gaat met die overdracht. The BargainB zal alle
                    redelijkerwijs noodzakelijke stappen ondernemen om ervoor te
                    zorgen dat uw gegevens veilig worden behandeld en in
                    overeenstemming met dit privacybeleid. Er zal geen
                    overdracht van uw Persoonsgegevens plaatsvinden naar een
                    organisatie of land tenzij er adequate
                    beveiligingsmaatregelen zijn getroffen, inclusief
                    bescherming van uw gegevens en andere persoonlijke
                    informatie.
                </>
            ),
        },
        {
            title: 'Openbaarmaking van Gegevens',
            content: (
                <>
                    <p>
                        Wij kunnen Persoonsgegevens die wij verzamelen of die u
                        aan ons verstrekt, openbaar maken in de volgende
                        gevallen:
                    </p>
                    <p>
                        <strong>Openbaarmaking voor wetshandhaving</strong>
                    </p>
                    <p>
                        Onder bepaalde omstandigheden kunnen wij verplicht zijn
                        om uw Persoonsgegevens openbaar te maken als dit
                        wettelijk vereist is of in antwoord op geldige verzoeken
                        van overheidsinstanties.
                    </p>
                    <p>
                        <strong>Zakelijke Transactie</strong>
                    </p>
                    <p>
                        Als wij of onze dochterondernemingen betrokken zijn bij
                        een fusie, overname of verkoop van activa, kunnen uw
                        Persoonsgegevens worden overgedragen.
                    </p>
                    <p>
                        <strong>Andere gevallen</strong>
                    </p>
                    <p>Wij kunnen uw informatie ook openbaar maken:</p>
                    <ol className='list-disc pl-8 py-2'>
                        <li>
                            aan onze dochterondernemingen en gelieerde
                            ondernemingen;
                        </li>
                        <li>
                            om het doel te vervullen waarvoor u de gegevens
                            verstrekt;
                        </li>
                        <li>met uw toestemming in alle andere gevallen;</li>
                        <li>
                            als wij van mening zijn dat openbaarmaking
                            noodzakelijk of gepast is om de rechten, eigendommen
                            of veiligheid van het bedrijf, onze klanten of
                            anderen te beschermen.
                        </li>
                    </ol>
                </>
            ),
        },
        {
            title: 'Beveiliging van Gegevens',
            content: (
                <>
                    De beveiliging van uw gegevens is belangrijk voor ons, maar
                    onthoud dat geen enkele methode van overdracht via het
                    internet of methode van elektronische opslag 100% veilig is.
                    Hoewel wij streven naar commercieel aanvaardbare middelen om
                    uw Persoonsgegevens te beschermen, kunnen wij de absolute
                    veiligheid ervan niet garanderen.
                </>
            ),
        },
        {
            title: 'Uw Rechten inzake Gegevensbescherming onder de Algemene Verordening Gegevensbescherming (AVG)',
            content: (
                <>
                    <p>
                        Als u inwoner bent van de Europese Unie (EU) of de
                        Europese Economische Ruimte (EER), hebt u bepaalde
                        rechten inzake gegevensbescherming, zoals vastgelegd in
                        de AVG. – Zie meer op:
                        https://eur-lex.europa.eu/eli/reg/2016/679/oj
                    </p>
                    <p>
                        Wij streven ernaar redelijke stappen te ondernemen om u
                        in staat te stellen uw Persoonsgegevens te corrigeren,
                        aan te passen, te verwijderen of het gebruik ervan te
                        beperken. Als u wilt weten welke Persoonsgegevens wij
                        over u hebben en als u wilt dat deze uit onze systemen
                        worden verwijderd, stuur dan een e-mail naar:
                        support@thebargainb.com.
                    </p>
                    <p>
                        In bepaalde omstandigheden hebt u de volgende rechten:
                    </p>
                    <ol className='list-[lower-alpha] pl-8 py-2'>
                        <li>
                            Het recht op inzage, bijwerking of verwijdering van
                            de gegevens die wij over u hebben;
                        </li>
                        <li>
                            Het recht op rectificatie: u hebt het recht om uw
                            gegevens te laten corrigeren als deze onjuist of
                            onvolledig zijn;
                        </li>
                        <li>
                            Het recht van bezwaar: u hebt het recht bezwaar te
                            maken tegen onze verwerking van uw Persoonsgegevens;
                        </li>
                        <li>
                            Het recht op beperking van de verwerking: u kunt
                            verzoeken om beperking van de verwerking van uw
                            persoonsgegevens;
                        </li>
                        <li>
                            Het recht op gegevensoverdraagbaarheid: u hebt recht
                            op een kopie van uw Persoonsgegevens in een
                            gestructureerd, gangbaar en machineleesbaar formaat;
                        </li>
                        <li>
                            Het recht om toestemming in te trekken: u hebt ook
                            het recht uw toestemming op elk moment in te
                            trekken, indien wij vertrouwen op uw toestemming
                            voor de verwerking van uw Persoonsgegevens.
                        </li>
                    </ol>
                    <p>
                        Let op dat wij u kunnen vragen uw identiteit te
                        verifiëren voordat wij op dergelijke verzoeken reageren.
                        Houd er rekening mee dat wij mogelijk bepaalde
                        noodzakelijke gegevens nodig hebben om de Dienst te
                        kunnen leveren. U hebt het recht om een klacht in te
                        dienen bij een toezichthoudende autoriteit inzake
                        gegevensbescherming over onze verzameling en het gebruik
                        van uw Persoonsgegevens. Voor meer informatie kunt u
                        contact opnemen met uw lokale
                        gegevensbeschermingsautoriteit binnen de EER.
                    </p>
                </>
            ),
        },
        {
            title: 'Uw Rechten inzake Gegevensbescherming onder de California Online Privacy Protection Act (CalOPPA)',
            content: (
                <>
                    <p>
                        CalOPPA is de eerste staatswet in de Verenigde Staten
                        die commerciële websites en online diensten verplicht
                        een privacybeleid te publiceren. De wet geldt niet
                        alleen in Californië, maar ook voor iedereen in de VS
                        (en zelfs wereldwijd) die websites exploiteert waarop
                        persoonlijk identificeerbare informatie van consumenten
                        uit Californië wordt verzameld. Volgens CalOPPA stemmen
                        wij in met het volgende:
                    </p>
                    <ol className='list-[lower-alpha] pl-8 py-2'>
                        <li>Gebruikers kunnen onze site anoniem bezoeken;</li>
                        <li>
                            Onze privacybeleidslink bevat het woord “Privacy” en
                            is gemakkelijk te vinden op de homepage van onze
                            website via de aangegeven pagina;
                        </li>
                        <li>
                            Gebruikers worden op de hoogte gesteld van eventuele
                            wijzigingen in het privacybeleid op onze
                            Privacybeleid-pagina;
                        </li>
                        <li>
                            Gebruikers kunnen hun persoonlijke informatie
                            wijzigen door ons te e-mailen via
                            support@thebargainb.com.
                        </li>
                    </ol>
                    <p>Ons Beleid omtrent “Do Not Track”-signalen:</p>
                    <p>
                        Wij respecteren Do Not Track-signalen en gebruiken geen
                        tracking, cookies of advertenties wanneer er een Do Not
                        Track-mechanisme in uw browser is geactiveerd. “Do Not
                        Track” is een voorkeur die u kunt instellen in uw
                        webbrowser om websites te laten weten dat u niet gevolgd
                        wilt worden. U kunt Do Not Track in- of uitschakelen via
                        de instellingen van uw webbrowser.
                    </p>
                </>
            ),
        },
        {
            title: 'Dienstverleners',
            content: (
                <>
                    Wij kunnen derde partijen inschakelen om onze Dienst te
                    vergemakkelijken (“Dienstverleners”), de Dienst namens ons
                    te leveren, Dienst-gerelateerde diensten te verlenen of ons
                    te helpen analyseren hoe onze Dienst wordt gebruikt. Deze
                    derden hebben alleen toegang tot uw Persoonsgegevens om deze
                    taken namens ons uit te voeren en zijn verplicht deze niet
                    openbaar te maken of voor andere doeleinden te gebruiken.
                </>
            ),
        },
        {
            title: 'Analyse',
            content: (
                <>
                    <p>
                        Wij kunnen gebruik maken van externe dienstverleners om
                        het gebruik van onze Dienst te monitoren en analyseren.
                    </p>

                    <p>
                        <strong>Google Analytics</strong>
                    </p>
                    <p>
                        Google Analytics is een webanalysedienst van Google die
                        websiteverkeer volgt en rapporteert. Google gebruikt de
                        verzamelde gegevens om het gebruik van onze Dienst bij
                        te houden en te monitoren. Deze gegevens kunnen worden
                        gedeeld met andere Google-diensten. Google kan de
                        verzamelde gegevens gebruiken om advertenties in zijn
                        eigen advertentienetwerk te personaliseren en te
                        contextualiseren.
                    </p>
                    <p>
                        Voor meer informatie over het privacybeleid van Google,
                        bezoek:{' '}
                        <a href='https://policies.google.com/privacy?hl=nl'>
                            https://policies.google.com/privacy?hl=nl
                        </a>{' '}
                        We raden u ook aan om hun beleid voor
                        gegevensbescherming te bekijken:{' '}
                        <a href='https://support.google.com/analytics/answer/6004245'>
                            https://support.google.com/analytics/answer/6004245
                        </a>
                    </p>

                    <p>
                        <strong>Firebase</strong>
                    </p>
                    <p>
                        Firebase is een analysetool aangeboden door Google Inc.
                        U kunt zich afmelden voor bepaalde Firebase-functies via
                        uw apparaatinstellingen of door de instructies in het
                        privacybeleid van Google te volgen:{' '}
                        <a href='https://policies.google.com/privacy?hl=nl'>
                            https://policies.google.com/privacy?hl=nl
                        </a>{' '}
                        Voor meer informatie over de gegevens die Firebase
                        verzamelt, zie:{' '}
                        <a href='https://policies.google.com/privacy'>
                            https://policies.google.com/privacy
                        </a>
                    </p>

                    <p>
                        <strong>Mixpanel</strong>
                    </p>
                    <p>
                        Mixpanel is een dienst aangeboden door Mixpanel Inc. U
                        kunt voorkomen dat Mixpanel uw gegevens gebruikt voor
                        analyse door u af te melden via:{' '}
                        <a href='https://mixpanel.com/optout/'>
                            https://mixpanel.com/optout/
                        </a>{' '}
                        Meer informatie over hun gebruiksvoorwaarden vindt u op:{' '}
                        <a href='https://mixpanel.com/terms/'>
                            https://mixpanel.com/terms/
                        </a>
                    </p>
                </>
            ),
        },
        {
            title: 'CI/CD Tools',
            content: (
                <>
                    <p>
                        Wij kunnen externe dienstverleners gebruiken om het
                        ontwikkelproces van onze Dienst te automatiseren.
                    </p>

                    <p>
                        <strong>GitHub</strong>
                    </p>
                    <p>
                        GitHub wordt aangeboden door GitHub, Inc. Het is een
                        ontwikkelplatform om code te hosten, projecten te
                        beheren en software te bouwen. Voor meer informatie over
                        de gegevens die GitHub verzamelt en hoe deze worden
                        beschermd, raadpleeg het privacybeleid van GitHub:{' '}
                        <a href='https://help.github.com/en/articles/github-privacy-statement'>
                            https://help.github.com/en/articles/github-privacy-statement
                        </a>
                    </p>
                </>
            ),
        },
        {
            title: 'Gedragsgerichte Remarketing',
            content: (
                <>
                    <p>
                        The BargainB maakt gebruik van remarketingdiensten om
                        advertenties aan u te tonen op websites van derden nadat
                        u onze Dienst hebt bezocht. Wij en onze externe
                        leveranciers gebruiken cookies om advertenties te
                        informeren, te optimaliseren en te tonen op basis van uw
                        eerdere bezoeken aan onze Dienst.
                    </p>

                    <p>
                        <strong>Google Ads (AdWords)</strong>
                    </p>
                    <p>
                        De remarketingdienst van Google Ads (AdWords) wordt
                        aangeboden door Google Inc. U kunt zich afmelden voor
                        Google Analytics voor display-advertenties en uw
                        voorkeuren voor Google Display Netwerk-advertenties
                        instellen via:
                        <a href='http://www.google.com/settings/ads'>
                            http://www.google.com/settings/ads
                        </a>
                    </p>
                    <p>
                        Google raadt ook aan de Google Analytics Opt-out Browser
                        Add-on te installeren:
                        <a href='https://tools.google.com/dlpage/gaoptout'>
                            https://tools.google.com/dlpage/gaoptout
                        </a>
                    </p>
                    <p>
                        Voor meer informatie over het privacybeleid van Google:
                        <a href='https://policies.google.com/privacy?hl=nl'>
                            https://policies.google.com/privacy?hl=nl
                        </a>
                    </p>

                    <p>
                        <strong>Twitter</strong>
                    </p>
                    <p>
                        De remarketingdienst van Twitter wordt geleverd door
                        Twitter Inc. U kunt zich afmelden voor
                        interessegebaseerde advertenties van Twitter via:
                        <a href='https://support.twitter.com/articles/20170405'>
                            https://support.twitter.com/articles/20170405
                        </a>
                    </p>
                    <p>
                        Bekijk hun privacybeleid hier:
                        <a href='https://twitter.com/privacy'>
                            https://twitter.com/privacy
                        </a>
                    </p>

                    <p>
                        <strong>Facebook</strong>
                    </p>
                    <p>
                        De remarketingdienst van Facebook wordt aangeboden door
                        Facebook Inc. Meer informatie over interessegebaseerde
                        advertenties van Facebook vindt u op:
                        <a href='https://www.facebook.com/help/164968693837950'>
                            https://www.facebook.com/help/164968693837950
                        </a>
                    </p>
                    <p>
                        Afmelden voor Facebook-advertenties kan via:
                        <a href='https://www.facebook.com/help/568137493302217'>
                            https://www.facebook.com/help/568137493302217
                        </a>
                    </p>
                    <p>
                        Facebook volgt de Zelfregulerende Principes voor Online
                        Gedragsadvertenties van de Digital Advertising Alliance.
                        U kunt zich ook afmelden via:
                    </p>
                    <ul className='list-disc pl-8 py-2'>
                        <li>
                            USA:{' '}
                            <a href='http://www.aboutads.info/choices/'>
                                http://www.aboutads.info/choices/
                            </a>
                        </li>
                        <li>
                            Canada:{' '}
                            <a href='http://youradchoices.ca/'>
                                http://youradchoices.ca/
                            </a>
                        </li>
                        <li>
                            Europa:{' '}
                            <a href='http://www.youronlinechoices.eu/'>
                                http://www.youronlinechoices.eu/
                            </a>
                        </li>
                    </ul>
                    <p>
                        Of via uw mobiele apparaatinstellingen. Bekijk het
                        privacybeleid van Facebook hier:
                        <a href='https://www.facebook.com/privacy/explanation'>
                            https://www.facebook.com/privacy/explanation
                        </a>
                    </p>
                </>
            ),
        },
        {
            title: 'Betalingen',
            content: (
                <>
                    <p>
                        Binnen onze Dienst kunnen we betaalde producten en/of
                        diensten aanbieden. In dat geval maken wij gebruik van
                        externe diensten voor betalingsverwerking (bijv.
                        betalingsverwerkers). Wij slaan geen betaalkaartgegevens
                        op of verzamelen deze niet. Deze informatie wordt direct
                        aan onze externe betalingsverwerkers verstrekt en hun
                        gebruik van uw persoonsgegevens wordt geregeld door hun
                        eigen privacybeleid.
                    </p>
                    <p>
                        Deze betalingsverwerkers voldoen aan de PCI-DSS-normen
                        zoals beheerd door de PCI Security Standards Council,
                        een samenwerking van merken zoals Visa, Mastercard,
                        American Express en Discover. De PCI-DSS-vereisten
                        helpen bij het veilig verwerken van betalingsinformatie.
                    </p>
                    <p>Onze betalingsverwerkers zijn:</p>
                    <ul className='list-disc pl-8 py-2'>
                        <li>
                            <p>
                                <strong>PayPal of Braintree:</strong>
                            </p>{' '}
                            Privacybeleid:
                            https://www.paypal.com/webapps/mpp/ua/privacy-full
                        </li>
                        <li>
                            <p>Apple Store In-App Payments:</p>{' '}
                            <p>
                                <strong>Privacybeleid</strong>
                            </p>{' '}
                            :https://www.apple.com/legal/privacy/en-ww/https://support.apple.com/en-us/HT203027
                        </li>
                        <li>
                            <p>Google Play In-App Payments:</p>{' '}
                            <p>
                                <strong>Privacybeleid</strong>
                            </p>{' '}
                            :https://policies.google.com/privacy?hl=nlhttps://payments.google.com/payments/apis-secure/u/0/get_legal_document?ldo=0&ldt=privacynotice&ldl=nl
                        </li>
                        <li>
                            <p>
                                <strong>Stripe:</strong>
                            </p>{' '}
                            Privacybeleid: https://stripe.com/nl/privacy
                        </li>
                    </ul>
                </>
            ),
        },
        {
            title: 'Links naar Andere Sites',
            content: (
                <>
                    <p>
                        Onze Dienst kan links bevatten naar andere websites die
                        niet door ons worden beheerd. Als u op een link van een
                        derde partij klikt, wordt u doorgestuurd naar de website
                        van die derde partij. Wij raden u sterk aan om het
                        privacybeleid van elke website die u bezoekt te
                        raadplegen.
                    </p>
                    <p>
                        Wij hebben geen controle over en aanvaarden geen
                        verantwoordelijkheid voor de inhoud, het privacybeleid
                        of de praktijken van websites of diensten van derden.
                    </p>
                </>
            ),
        },
        {
            title: 'Privacy van Kinderen',
            content: (
                <>
                    <p>
                        Onze Diensten zijn niet bedoeld voor gebruik door
                        kinderen onder de 13 jaar (“Kinderen”). Wij verzamelen
                        niet bewust persoonlijk identificeerbare informatie van
                        kinderen jonger dan 13. Als u merkt dat een kind ons
                        persoonlijke gegevens heeft verstrekt, neem dan contact
                        met ons op. Als wij ontdekken dat wij persoonlijke
                        gegevens hebben verzameld van kinderen zonder
                        verificatie van ouderlijke toestemming, nemen wij
                        maatregelen om die informatie van onze servers te
                        verwijderen.
                    </p>
                </>
            ),
        },
        {
            title: 'Wijzigingen in Dit Privacybeleid',
            content: (
                <>
                    <p>
                        Wij kunnen ons privacybeleid van tijd tot tijd
                        bijwerken. Wij zullen u op de hoogte stellen van
                        eventuele wijzigingen door het nieuwe privacybeleid op
                        deze pagina te plaatsen. Wij laten u dit weten via
                        e-mail en/of via een prominente kennisgeving in onze
                        Dienst, voordat de wijziging van kracht wordt, en we
                        zullen de “ingangsdatum” bovenaan dit privacybeleid
                        bijwerken.
                    </p>
                    <p>
                        U wordt geadviseerd dit privacybeleid regelmatig te
                        controleren op wijzigingen. Wijzigingen in dit
                        privacybeleid zijn van kracht zodra ze op deze pagina
                        zijn geplaatst.
                    </p>
                </>
            ),
        },
        {
            title: 'Contact met Ons',
            content: (
                <>
                    <p>
                        Als u vragen heeft over dit privacybeleid, neem dan
                        contact met ons op:
                    </p>
                    <p>Per e-mail: support@thebargainb.com</p>
                </>
            ),
        },
    ];
    return (
        <div className='container m-auto px-10 md:px-40 py-10'>
            <Image
                src='/background-effect.svg'
                alt='shadow'
                width={2500}
                height={500}
                className='absolute top-0 left-1/2 -z-10 -translate-x-1/2'
            />
            {/* Header */}
            <header className="relative z-20 w-full px-6 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <BargainBLogo className="h-8 w-auto" />
                    <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <ThemeToggle />
                    </div>
                </div>
            </header>
            <div>
                <h2 className='font-[family-name:var(--font-paytone-one)] text-[#0F0F0F] text-[28px] md:text-[32px] text-center mt-20'>
                    Privacybeleid & Algemene Voorwaarden
                </h2>
            </div>
            <div className='max-w-7xl m-auto'>
                <ol className='list-decimal md:pl-5 py-5 font-[family-name:var(--font-inter)] mb-10'>
                    {sections.map(({ title, content }, idx) => (
                        <li key={idx} className='whitespace-pre-line'>
                            <h2 className='font-[family-name:var(--font-inter)] font-bold text-lg text-[#0F0F0F] my-4'>
                                {title}
                            </h2>
                            <div className='font-[family-name:var(--font-inter)] text-sm text-[#0F0F0F]'>
                                {content}
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
            {/* <ScrollToTop /> */}
            <Footer /> 
        </div>
    );
}
