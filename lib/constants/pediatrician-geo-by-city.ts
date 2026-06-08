export type RelatedLinkSeed = {
  label: string;
  slug: string;
};

export type HospitalLinkSeed = RelatedLinkSeed & {
  hospitalSlug: string;
  areaSlug: string;
};

export type PediatricianGeoConfig = {
  hospitals: HospitalLinkSeed[];
  areas: RelatedLinkSeed[];
};

export const LAHORE_PEDIATRICIAN_GEO: PediatricianGeoConfig = {
  hospitals: [
    { label: "Doctors Hospital", slug: "doctors-hospital", hospitalSlug: "doctors-hospital", areaSlug: "johar-town" },
    { label: "Dr Faiza Kaifee", slug: "dr-faiza-kaifee", hospitalSlug: "dr-faiza-kaifee", areaSlug: "dha" },
    {
      label: "Muhammad specialty clinic",
      slug: "muhammad-specialty-clinic",
      hospitalSlug: "muhammad-specialty-clinic",
      areaSlug: "lahore",
    },
    { label: "Noor Hospital", slug: "noor-hospital", hospitalSlug: "noor-hospital", areaSlug: "ferozepur-road" },
    {
      label: "Iqraa Medical Complex Ext Hospital",
      slug: "iqraa-medical-complex-ext-hospital",
      hospitalSlug: "iqraa-medical-complex-ext-hospital",
      areaSlug: "johar-town",
    },
    {
      label: "Integrated Medical Care (IMC) Hospital",
      slug: "integrated-medical-care-imc-hospital",
      hospitalSlug: "integrated-medical-care-imc-hospital",
      areaSlug: "sector-f-phase-5-dha",
    },
    {
      label: "Evercare Hospital",
      slug: "evercare-hospital",
      hospitalSlug: "evercare-hospital",
      areaSlug: "nespak-housing-scheme",
    },
    {
      label: "Iqraa Medical Complex (IMC) Old Building",
      slug: "iqraa-medical-complex-imc-old-building",
      hospitalSlug: "iqraa-medical-complex-imc-old-building",
      areaSlug: "johar-town",
    },
    { label: "Shalamar Hospital", slug: "shalamar-hospital", hospitalSlug: "shalamar-hospital", areaSlug: "mughalpura" },
    {
      label: "Rafique Clinic",
      slug: "rafique-clinic",
      hospitalSlug: "rafique-clinic",
      areaSlug: "valencia-housing-society",
    },
  ],
  areas: [
    { label: "Johar Town", slug: "johar-town" },
    { label: "punjab", slug: "punjab" },
    { label: "Nespak Housing Scheme", slug: "nespak-housing-scheme" },
    { label: "Bahria Town", slug: "bahria-town" },
    { label: "Ferozepur Road", slug: "ferozepur-road" },
    { label: "DHA Phase 6", slug: "dha-phase-6" },
    { label: "Valencia Housing Society", slug: "valencia-housing-society" },
    { label: "Sector F Phase 5 D.H.A", slug: "sector-f-phase-5-dha" },
    { label: "Faisal Town", slug: "faisal-town" },
    { label: "Garden Town", slug: "garden-town" },
    { label: "DHA Defence", slug: "dha-defence" },
    { label: "Shahdara", slug: "shahdara" },
    { label: "Kahna", slug: "kahna" },
    { label: "Lahore", slug: "lahore" },
    { label: "Township", slug: "township" },
    { label: "Muslim Town", slug: "muslim-town" },
    { label: "Dubai chowk", slug: "dubai-chowk" },
    { label: "DHA Phase 8", slug: "dha-phase-8" },
    { label: "Model Town", slug: "model-town" },
    { label: "Mozang Chungi", slug: "mozang-chungi" },
  ],
};

export const KARACHI_PEDIATRICIAN_GEO: PediatricianGeoConfig = {
  hospitals: [
    {
      label: "North Medical Centre",
      slug: "north-medical-centre",
      hospitalSlug: "north-medical-centre",
      areaSlug: "north-nazimabad",
    },
    { label: "Saifee Hospital", slug: "saifee-hospital", hospitalSlug: "saifee-hospital", areaSlug: "north-nazimabad" },
    {
      label: "Tabba kidney Institute",
      slug: "tabba-kidney-institute",
      hospitalSlug: "tabba-kidney-institute",
      areaSlug: "defence-view",
    },
    {
      label: "Holy Family Hospital",
      slug: "holy-family-hospital",
      hospitalSlug: "holy-family-hospital",
      areaSlug: "soldier-bazar",
    },
    {
      label: "Midciti Hospital",
      slug: "midciti-hospital",
      hospitalSlug: "midciti-hospital",
      areaSlug: "national-stadium",
    },
    { label: "Federal Hospital", slug: "federal-hospital", hospitalSlug: "federal-hospital", areaSlug: "north-nazimabad" },
    { label: "Burhani Hospital", slug: "burhani-hospital", hospitalSlug: "burhani-hospital", areaSlug: "new-chali" },
    {
      label: "Lady Dufferin Hospital",
      slug: "lady-dufferin-hospital",
      hospitalSlug: "lady-dufferin-hospital",
      areaSlug: "kharadar",
    },
    {
      label: "SHED Homes Complex & Hospital",
      slug: "shed-homes-complex-hospital",
      hospitalSlug: "shed-homes-complex-hospital",
      areaSlug: "north-karachi",
    },
    {
      label: "FM General Hospital / Maternity Home",
      slug: "fm-general-hospital-maternity-home",
      hospitalSlug: "fm-general-hospital-maternity-home",
      areaSlug: "north-nazimabad",
    },
  ],
  areas: [
    { label: "North Nazimabad", slug: "north-nazimabad" },
    { label: "Clifton", slug: "clifton" },
    { label: "DHA City Karachi", slug: "dha-city-karachi" },
    { label: "North Karachi", slug: "north-karachi" },
    { label: "Karachi", slug: "karachi" },
    { label: "DHA", slug: "dha" },
    { label: "Off Shahrah-e-Faisal", slug: "off-shahrah-e-faisal" },
    { label: "Gulshan e Iqbal", slug: "gulshan-e-iqbal" },
    { label: "Orangi Town", slug: "orangi-town" },
    { label: "Gulberg Town", slug: "gulberg-town" },
    { label: "F.B Area", slug: "f-b-area" },
    { label: "Ranchore Line - Saddar", slug: "ranchore-line-saddar" },
    { label: "national stadium", slug: "national-stadium" },
    { label: "Sindh", slug: "sindh" },
    { label: "Model Colony", slug: "model-colony" },
    { label: "New Chali", slug: "new-chali" },
    { label: "Pakistan", slug: "pakistan" },
    { label: "near yadgar fish", slug: "near-yadgar-fish" },
    { label: "Nazimabad", slug: "nazimabad" },
    { label: "0", slug: "0" },
  ],
};

export const ISLAMABAD_PEDIATRICIAN_GEO: PediatricianGeoConfig = {
  hospitals: [
    { label: "Emaan Hospital", slug: "emaan-hospital", hospitalSlug: "emaan-hospital", areaSlug: "ghauri-town" },
    {
      label: "Rawal Institute Of Health Sciences Hospital",
      slug: "rawal-institute-of-health-sciences-hospital",
      hospitalSlug: "rawal-institute-of-health-sciences-hospital",
      areaSlug: "islamabad",
    },
    {
      label: "Well Med Clinic & Vccination Centre",
      slug: "well-med-clinic-vccination-centre",
      hospitalSlug: "well-med-clinic-vccination-centre",
      areaSlug: "islamabad",
    },
    { label: "Fatima Hospital", slug: "fatima-hospital", hospitalSlug: "fatima-hospital", areaSlug: "ghauri-town" },
    {
      label: "DR.MARIA SHAMSHER CHILD SPECIALIST ( Pediatric Clinic )",
      slug: "dr-maria-shamsher-child-specialist-pediatric-clinic",
      hospitalSlug: "dr-maria-shamsher-child-specialist-pediatric-clinic",
      areaSlug: "islamabad",
    },
    { label: "Sarf Hospital", slug: "sarf-hospital", hospitalSlug: "sarf-hospital", areaSlug: "f-10" },
    {
      label: "Shaafi International Hospital",
      slug: "shaafi-international-hospital",
      hospitalSlug: "shaafi-international-hospital",
      areaSlug: "islamabad",
    },
    {
      label: "Ayesha Hospital and Maternity Center",
      slug: "ayesha-hospital-and-maternity-center",
      hospitalSlug: "ayesha-hospital-and-maternity-center",
      areaSlug: "islamabad",
    },
    {
      label: "Noor General Hospital",
      slug: "noor-general-hospital",
      hospitalSlug: "noor-general-hospital",
      areaSlug: "g-11-markaz",
    },
  ],
  areas: [
    { label: "G-8 Markaz", slug: "g-8-markaz" },
    { label: "Islamabad", slug: "islamabad" },
    { label: "G8 Markaz", slug: "g8-markaz" },
    { label: "I-8", slug: "i-8" },
    { label: "Islamabad Capital Territory", slug: "islamabad-capital-territory" },
    { label: "PWD Town", slug: "pwd-town" },
    { label: "Ghauri Town", slug: "ghauri-town" },
    { label: "Sector F", slug: "sector-f" },
    { label: "G-6", slug: "g-6" },
    { label: "G-11 Markaz", slug: "g-11-markaz" },
    { label: "G-10 Markaz", slug: "g-10-markaz" },
    { label: "Sector I", slug: "sector-i" },
    { label: "0", slug: "0" },
    { label: "Pakistan", slug: "pakistan" },
    { label: "Karal Chwok", slug: "karal-chwok" },
    { label: "River gardens", slug: "river-gardens" },
    { label: "Sector E", slug: "sector-e" },
    { label: "Sector G", slug: "sector-g" },
  ],
};

export const RAWALPINDI_PEDIATRICIAN_GEO: PediatricianGeoConfig = {
  hospitals: [
    {
      label: "Mega Medical Complex Hospital",
      slug: "mega-medical-complex-hospital",
      hospitalSlug: "mega-medical-complex-hospital",
      areaSlug: "cantt",
    },
    {
      label: "Jinnah Memorial Hospital",
      slug: "jinnah-memorial-hospital",
      hospitalSlug: "jinnah-memorial-hospital",
      areaSlug: "cantt",
    },
    {
      label: "Nazeer Begum Memorial Hospital",
      slug: "nazeer-begum-memorial-hospital",
      hospitalSlug: "nazeer-begum-memorial-hospital",
      areaSlug: "rawalpindi",
    },
    {
      label: "Ahmed Medical Complex Hospital",
      slug: "ahmed-medical-complex-hospital",
      hospitalSlug: "ahmed-medical-complex-hospital",
      areaSlug: "satellite-town",
    },
    { label: "Nusrat Hospital", slug: "nusrat-hospital", hospitalSlug: "nusrat-hospital", areaSlug: "westridge-peshawar-road" },
    { label: "Al Ihsan Hospital", slug: "al-ihsan-hospital", hospitalSlug: "al-ihsan-hospital", areaSlug: "saddar" },
  ],
  areas: [
    { label: "Rawalpindi", slug: "rawalpindi" },
    { label: "Bahria Town", slug: "bahria-town" },
    { label: "Bahria Town Phase 7", slug: "bahria-town-phase-7" },
    { label: "Satellite Town", slug: "satellite-town" },
    { label: "Cantt", slug: "cantt" },
    { label: "Westridge Peshawar Road", slug: "westridge-peshawar-road" },
    { label: "Bahria Phase 7", slug: "bahria-phase-7" },
    { label: "Wah Cantt", slug: "wah-cantt" },
    { label: "Sattelite Town", slug: "sattelite-town" },
    { label: "Saddar", slug: "saddar" },
    { label: "Rawat", slug: "rawat" },
    { label: "Peshawar Road", slug: "peshawar-road" },
    { label: "Lalkurti", slug: "lalkurti" },
    { label: "Islamabad", slug: "islamabad" },
    { label: "Chaklala Scheme 3", slug: "chaklala-scheme-3" },
    { label: "Boston Road", slug: "boston-road" },
    { label: "Block E Satellite Town", slug: "block-e-satellite-town" },
  ],
};

export const FAISALABAD_PEDIATRICIAN_GEO: PediatricianGeoConfig = {
  hospitals: [
    {
      label: "Islamabad diagnostic centre .",
      slug: "islamabad-diagnostic-centre",
      hospitalSlug: "islamabad-diagnostic-centre",
      areaSlug: "madina-town",
    },
    {
      label: "The Family Clinic Child Care & Cure Complex",
      slug: "the-family-clinic-child-care-cure-complex",
      hospitalSlug: "the-family-clinic-child-care-cure-complex",
      areaSlug: "sadaf-amin-town",
    },
    {
      label: "Faisal Hospital (New building)",
      slug: "faisal-hospital-new-building",
      hospitalSlug: "faisal-hospital-new-building",
      areaSlug: "peoples-colony-no-1",
    },
    { label: "Hajra Kareem Hospital", slug: "hajra-kareem-hospital", hospitalSlug: "hajra-kareem-hospital", areaSlug: "batala-colony" },
    { label: "Mujahid Hospital", slug: "mujahid-hospital", hospitalSlug: "mujahid-hospital", areaSlug: "madina-town" },
  ],
  areas: [
    { label: "punjab", slug: "punjab" },
    { label: "Madina Town", slug: "madina-town" },
    { label: "Pakistan", slug: "pakistan" },
    { label: "University Town", slug: "university-town" },
    { label: "Satyana Road", slug: "satyana-road" },
    { label: "Samnabad", slug: "samnabad" },
    { label: "Saeed Colony", slug: "saeed-colony" },
    { label: "Sadaf Amin Town", slug: "sadaf-amin-town" },
    { label: "Peoples Colony 1", slug: "peoples-colony-1" },
    { label: "People Colony No 1, Faisalabad", slug: "people-colony-no-1-faisalabad" },
    { label: "afshan colony", slug: "afshan-colony" },
    { label: "Jhang Road", slug: "jhang-road" },
    { label: "Jail Road", slug: "jail-road" },
    { label: "Faisalabad", slug: "faisalabad" },
    { label: "Dijkot", slug: "dijkot" },
    { label: "Crestex", slug: "crestex" },
    { label: "Batala Colony", slug: "batala-colony" },
  ],
};

export const MULTAN_PEDIATRICIAN_GEO: PediatricianGeoConfig = {
  hospitals: [
    {
      label: "South Punjab Hospital",
      slug: "south-punjab-hospital",
      hospitalSlug: "south-punjab-hospital",
      areaSlug: "suraj-miani-road",
    },
    {
      label: "Medical Links Hospital",
      slug: "medical-links-hospital",
      hospitalSlug: "medical-links-hospital",
      areaSlug: "model-town-chowk",
    },
    { label: "Medicare Hospital", slug: "medicare-hospital", hospitalSlug: "medicare-hospital", areaSlug: "altaf-town" },
    {
      label: "Al-Kareem Medical Center",
      slug: "al-kareem-medical-center",
      hospitalSlug: "al-kareem-medical-center",
      areaSlug: "fatma-jinnah-town",
    },
    {
      label: "Arham Childcare Clinic",
      slug: "arham-childcare-clinic",
      hospitalSlug: "arham-childcare-clinic",
      areaSlug: "0",
    },
    { label: "Children Clinic", slug: "children-clinic", hospitalSlug: "children-clinic", areaSlug: "punjab" },
  ],
  areas: [
    { label: "Suraj Miani Road", slug: "suraj-miani-road" },
    { label: "Bosan Rd", slug: "bosan-rd" },
    { label: "punjab", slug: "punjab" },
    { label: "0", slug: "0" },
    { label: "Altaf Town", slug: "altaf-town" },
    { label: "Model Town", slug: "model-town" },
    { label: "Zakariya Town", slug: "zakariya-town" },
    { label: "Qadirabad", slug: "qadirabad" },
    { label: "PIA Colony", slug: "pia-colony" },
    { label: "Multan", slug: "multan" },
    { label: "Model Town Chowk", slug: "model-town-chowk" },
    { label: "Jamilabad Colony", slug: "jamilabad-colony" },
    { label: "Garden Town", slug: "garden-town" },
    { label: "Fatma Jinnah Town", slug: "fatma-jinnah-town" },
    { label: "Bypass Road", slug: "bypass-road" },
    { label: "Awan Chowk", slug: "awan-chowk" },
  ],
};

export const PESHAWAR_PEDIATRICIAN_GEO: PediatricianGeoConfig = {
  hospitals: [
    {
      label: "Rehman Medical Institute Hospital",
      slug: "rehman-medical-institute-hospital",
      hospitalSlug: "rehman-medical-institute-hospital",
      areaSlug: "hayatabad",
    },
    {
      label: "Institute Of Kidney Diseases",
      slug: "institute-of-kidney-diseases",
      hospitalSlug: "institute-of-kidney-diseases",
      areaSlug: "hayatabad",
    },
    {
      label: "Baba Medical Center",
      slug: "baba-medical-center",
      hospitalSlug: "baba-medical-center",
      areaSlug: "dabgari-garden",
    },
    {
      label: "Lady Reading Hospital Peshawar",
      slug: "lady-reading-hospital-peshawar",
      hospitalSlug: "lady-reading-hospital-peshawar",
      areaSlug: "kpk",
    },
    {
      label: "Saidan Shah Building",
      slug: "saidan-shah-building",
      hospitalSlug: "saidan-shah-building",
      areaSlug: "dabgari-garden",
    },
  ],
  areas: [
    { label: "Hayatabad", slug: "hayatabad" },
    { label: "Dabgari Garden", slug: "dabgari-garden" },
    { label: "Dabgari Gardens", slug: "dabgari-gardens" },
    { label: "Hakeem Ullah Jan Road", slug: "hakeem-ullah-jan-road" },
    { label: "Hasht Nagri", slug: "hasht-nagri" },
    { label: "Khyber Pakhtunkhwa", slug: "khyber-pakhtunkhwa" },
    { label: "KPK", slug: "kpk" },
    { label: "Phase 5 Hayatabad", slug: "phase-5-hayatabad" },
  ],
};

export const QUETTA_PEDIATRICIAN_GEO: PediatricianGeoConfig = {
  hospitals: [
    { label: "Al Noor Clinic", slug: "al-noor-clinic", hospitalSlug: "al-noor-clinic", areaSlug: "toghi-road" },
    { label: "Doctors Hospital", slug: "doctors-hospital", hospitalSlug: "doctors-hospital", areaSlug: "quetta-city" },
    { label: "BA Healthcare Hospital", slug: "ba-healthcare-hospital", hospitalSlug: "ba-healthcare-hospital", areaSlug: "quetta" },
    {
      label: "Heart And General Hospital",
      slug: "heart-and-general-hospital",
      hospitalSlug: "heart-and-general-hospital",
      areaSlug: "model-town",
    },
    { label: "Mid East Hospital", slug: "mid-east-hospital", hospitalSlug: "mid-east-hospital", areaSlug: "zarghon-road" },
    {
      label: "City International Hospital",
      slug: "city-international-hospital",
      hospitalSlug: "city-international-hospital",
      areaSlug: "quetta-city",
    },
    {
      label: "Bakhtawar memorial hospital",
      slug: "bakhtawar-memorial-hospital",
      hospitalSlug: "bakhtawar-memorial-hospital",
      areaSlug: "quetta",
    },
  ],
  areas: [
    { label: "Quetta City", slug: "quetta-city" },
    { label: "Quetta", slug: "quetta" },
    { label: "Zarghon Road", slug: "zarghon-road" },
    { label: "almo chowk", slug: "almo-chowk" },
    { label: "Hazara town", slug: "hazara-town" },
    { label: "Model Town", slug: "model-town" },
    { label: "0", slug: "0" },
    { label: "Patel Bagh", slug: "patel-bagh" },
    { label: "Toghi Road", slug: "toghi-road" },
  ],
};

export const GUJRANWALA_PEDIATRICIAN_GEO: PediatricianGeoConfig = {
  hospitals: [
    {
      label: "Rafique Children Complex",
      slug: "rafique-children-complex",
      hospitalSlug: "rafique-children-complex",
      areaSlug: "main-model-town-road",
    },
    { label: "Rehman clinic", slug: "rehman-clinic", hospitalSlug: "rehman-clinic", areaSlug: "0" },
  ],
  areas: [
    { label: "Bypass", slug: "bypass" },
    { label: "Bypass Road", slug: "bypass-road" },
    { label: "Citi Housing", slug: "citi-housing" },
    { label: "DC Colony", slug: "dc-colony" },
    { label: "Gujranwala", slug: "gujranwala" },
    { label: "Main Model Town Road", slug: "main-model-town-road" },
    { label: "0", slug: "0" },
    { label: "People Colony", slug: "people-colony" },
    { label: "Rahwali", slug: "rahwali" },
    { label: "Satellite Town", slug: "satellite-town" },
    { label: "Sialkot Road", slug: "sialkot-road" },
  ],
};

export const SARGODHA_PEDIATRICIAN_GEO: PediatricianGeoConfig = {
  hospitals: [
    { label: "Al Abbas Hospital", slug: "al-abbas-hospital", hospitalSlug: "al-abbas-hospital", areaSlug: "satellite-town" },
    {
      label: "Mubarak Medical Complex New Block",
      slug: "mubarak-medical-complex-new-block",
      hospitalSlug: "mubarak-medical-complex-new-block",
      areaSlug: "satellite-town",
    },
  ],
  areas: [
    { label: "Satellite Town", slug: "satellite-town" },
    { label: "Main Gujrat Road", slug: "main-gujrat-road" },
    { label: "punjab", slug: "punjab" },
    { label: "Sargodha Road", slug: "sargodha-road" },
  ],
};

export const PEDIATRICIAN_GEO_BY_CITY: Record<string, PediatricianGeoConfig> = {
  lahore: LAHORE_PEDIATRICIAN_GEO,
  karachi: KARACHI_PEDIATRICIAN_GEO,
  islamabad: ISLAMABAD_PEDIATRICIAN_GEO,
  rawalpindi: RAWALPINDI_PEDIATRICIAN_GEO,
  faisalabad: FAISALABAD_PEDIATRICIAN_GEO,
  multan: MULTAN_PEDIATRICIAN_GEO,
  peshawar: PESHAWAR_PEDIATRICIAN_GEO,
  quetta: QUETTA_PEDIATRICIAN_GEO,
  gujranwala: GUJRANWALA_PEDIATRICIAN_GEO,
  sargodha: SARGODHA_PEDIATRICIAN_GEO,
};
