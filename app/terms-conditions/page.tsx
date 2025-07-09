// import FooterSection from '@/components/footer';
// import ScrollToTop from '@/components/scroll-to-top';
import { BargainBLogo } from '@/components/bargainb-logo';
import Footer from '@/components/footer';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';

export default function TermsConditions() {
    const sections = [
        {
            title: 'Introductie',
            content: (
                <>
                    <p>
                        Deze Algemene Voorwaarden zijn van toepassing op het
                        gebruik van de diensten aangeboden door BargainB ("wij",
                        "ons", "onze") via de website https://thebargainb.com/
                        en de BargainB mobiele applicatie (gezamenlijk de
                        "Dienst"). Door gebruik te maken van onze Dienst gaat u
                        akkoord met deze voorwaarden. Lees ze daarom zorgvuldig
                        door.
                    </p>
                </>
            ),
        },
        {
            title: 'Gebruik van de Dienst',
            content: (
                <>
                    <p>Om gebruik te maken van onze Dienst moet u:</p>
                    <ol className='list-[lower-alpha] pl-8 py-2'>
                        <li>
                            18 jaar of ouder zijn, of toestemming hebben van een
                            ouder/voogd
                        </li>
                        <li>Een geldig telefoonnummer hebben</li>
                        <li>
                            Accurate en volledige informatie verstrekken bij
                            registratie
                        </li>
                        <li>Uw accountgegevens vertrouwelijk houden</li>
                    </ol>
                    <p>
                        U bent verantwoordelijk voor alle activiteiten die onder
                        uw account plaatsvinden.
                    </p>
                </>
            ),
        },
        {
            title: 'Dienstverlening',
            content: (
                <>
                    <p>BargainB biedt een platform dat:</p>
                    <ol className='list-[lower-alpha] pl-8 py-2'>
                        <li>
                            Gebruikers informeert over aanbiedingen en kortingen
                            bij verschillende winkels
                        </li>
                        <li>
                            Gepersonaliseerde aanbevelingen doet op basis van
                            voorkeuren
                        </li>
                        <li>
                            Communicatie faciliteert via WhatsApp voor updates
                            en notificaties
                        </li>
                    </ol>
                    <p>
                        Wij streven ernaar onze Dienst continu beschikbaar te
                        houden, maar kunnen dit niet garanderen. Onderhoud,
                        updates of technische problemen kunnen de
                        beschikbaarheid beïnvloeden.
                    </p>
                </>
            ),
        },
        {
            title: 'Gebruiksvoorwaarden',
            content: (
                <>
                    <p>Het is niet toegestaan om:</p>
                    <ol className='list-[lower-alpha] pl-8 py-2'>
                        <li>De Dienst te gebruiken voor illegale doeleinden</li>
                        <li>
                            Inbreuk te maken op intellectuele eigendomsrechten
                        </li>
                        <li>De Dienst te gebruiken om spam te versturen</li>
                        <li>
                            Het normaal functioneren van de Dienst te verstoren
                        </li>
                        <li>
                            Geautomatiseerde systemen te gebruiken om toegang te
                            krijgen tot de Dienst
                        </li>
                    </ol>
                </>
            ),
        },
        {
            title: 'Intellectueel Eigendom',
            content: (
                <>
                    <p>
                        Alle content op onze Dienst (inclusief maar niet beperkt
                        tot teksten, afbeeldingen, logo's, software) is eigendom
                        van BargainB of onze licentiegevers en wordt beschermd
                        door intellectuele eigendomsrechten. Het is niet
                        toegestaan deze content te kopiëren, distribueren of
                        gebruiken zonder onze uitdrukkelijke toestemming.
                    </p>
                </>
            ),
        },
        {
            title: 'Privacy en Gegevensbescherming',
            content: (
                <>
                    <p>
                        Wij verwerken uw persoonsgegevens volgens ons
                        Privacybeleid. Door gebruik te maken van onze Dienst
                        gaat u akkoord met deze verwerking. Voor meer informatie
                        over hoe wij omgaan met uw gegevens, raadpleeg ons
                        Privacybeleid.
                    </p>
                </>
            ),
        },
        {
            title: 'Aansprakelijkheid',
            content: (
                <>
                    <p>BargainB is niet aansprakelijk voor:</p>
                    <ol className='list-[lower-alpha] pl-8 py-2'>
                        <li>
                            Indirecte schade die voortvloeit uit het gebruik van
                            onze Dienst
                        </li>
                        <li>
                            Onjuistheid of onvolledigheid van de getoonde
                            informatie
                        </li>
                        <li>
                            Schade door onderbrekingen in de dienstverlening
                        </li>
                        <li>Acties van derde partijen op ons platform</li>
                    </ol>
                </>
            ),
        },
        {
            title: 'Wijzigingen',
            content: (
                <>
                    <p>
                        Wij behouden ons het recht voor om deze voorwaarden te
                        wijzigen. Belangrijke wijzigingen worden vooraf
                        aangekondigd. Door gebruik te blijven maken van de
                        Dienst na wijzigingen gaat u akkoord met de aangepaste
                        voorwaarden.
                    </p>
                </>
            ),
        },
        {
            title: 'Toepasselijk Recht',
            content: (
                <>
                    <p>
                        Op deze voorwaarden is Nederlands recht van toepassing.
                        Geschillen worden voorgelegd aan de bevoegde rechter in
                        Nederland.
                    </p>
                </>
            ),
        },
        {
            title: 'Contact',
            content: (
                <>
                    <p>
                        Voor vragen over deze voorwaarden kunt u contact met ons
                        opnemen via:
                    </p>
                    <p>E-mail: support@thebargainb.com</p>
                    <p>
                        Postadres: BargainB, Van Arembergelaan 105, 2274BR
                        Voorburg, Nederland
                    </p>
                </>
            ),
        },
    ];

    return (
        <div className='px-10 md:px-40 py-10'>
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
                    Algemene Voorwaarden
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
            {/* <ScrollToTop />*/}
            <Footer /> 
        </div>
    );
}
