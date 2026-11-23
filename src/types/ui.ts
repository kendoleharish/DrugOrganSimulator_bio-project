export type StandardOrganKey = 'brain' | 'heart' | 'liver' | 'stomach' | 'kidneys';
export type OrganKey = StandardOrganKey | string;

export type AnatomySex = 'male' | 'female';

/**
 * Standard Physiological Systems of the Human Body
 * Grounded in authentic medical anatomy (FMA / Terminologia Anatomica)
 */
export type PhysiologicalSystem = 
  | 'skin' 
  | 'muscles' 
  | 'skeleton' 
  | 'nervous' 
  | 'cardiovascular' 
  | 'respiratory' 
  | 'digestive' 
  | 'urinary' 
  | 'endocrine' 
  | 'reproductive';

export type AnatomySystem = PhysiologicalSystem;

export interface StructureSystemClassification {
  key: string;
  system: PhysiologicalSystem;
}

/**
 * Helper to resolve the authentic physiological system for any anatomical structure
 */
export function getStructurePhysiologicalSystem(item: { key: string; system?: string; category?: string }): PhysiologicalSystem {
  const k = item.key;
  const sys = item.system;
  const cat = item.category;

  if (k === 'skin' || sys === 'skin') return 'skin';
  if (sys === 'muscles') return 'muscles';
  if (sys === 'skeleton' || sys === 'joints') return 'skeleton';
  if (sys === 'nerves' || ['brain', 'brainstem', 'cerebellum'].includes(k) || cat === 'Neurological') return 'nervous';
  if (sys === 'vessels' || k === 'heart' || cat === 'Cardiovascular') return 'cardiovascular';
  if (['lung_l', 'lung_r', 'bronchi', 'trachea', 'larynx'].includes(k) || cat === 'Respiratory') return 'respiratory';
  if (['stomach', 'liver', 'gallbladder', 'colon', 'small_intestine', 'esophagus', 'appendix', 'pancreas'].includes(k) || cat === 'Digestive') return 'digestive';
  if (['kidney_l', 'kidney_r', 'ureter_l', 'ureter_r', 'bladder'].includes(k) || cat === 'Renal / Urinary') return 'urinary';
  if (['adrenal_l', 'adrenal_r', 'pituitary', 'thymus', 'spleen'].includes(k) || ['Endocrine', 'Immune / Lymphatic'].includes(cat || '')) return 'endocrine';
  if (['reproductive', 'prostate', 'ovary_l', 'ovary_r', 'uterus', 'fallopian_tubes', 'vagina', 'breast_l', 'breast_r'].includes(k) || cat === 'Reproductive') return 'reproductive';
  return 'digestive';
}

export interface CameraViewPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  distance?: number;
}

export const ANATOMICAL_CAMERA_PRESETS: Record<string, CameraViewPreset> = {
  full: {
    name: 'Full Standing Anatomical',
    position: [0, 0.95, 3.2],
    target: [0, 0.92, 0],
    distance: 3.2
  },
  anterior: {
    name: 'Anterior (Front)',
    position: [0, 0.95, 2.9],
    target: [0, 0.92, 0],
    distance: 2.9
  },
  posterior: {
    name: 'Posterior (Dorsal)',
    position: [0, 0.95, -2.9],
    target: [0, 0.92, 0],
    distance: 2.9
  },
  lateralLeft: {
    name: 'Lateral Left',
    position: [2.9, 0.95, 0],
    target: [0, 0.92, 0],
    distance: 2.9
  },
  lateralRight: {
    name: 'Lateral Right',
    position: [-2.9, 0.95, 0],
    target: [0, 0.92, 0],
    distance: 2.9
  },
  superior: {
    name: 'Superior (Cranial View)',
    position: [0, 2.6, 0.6],
    target: [0, 1.4, 0],
    distance: 2.0
  },
  cranial: {
    name: 'Cranial & Neurovascular',
    position: [0, 1.65, 0.85],
    target: [0, 1.62, 0],
    distance: 0.85
  },
  thoracic: {
    name: 'Thoracic (Cardiopulmonary)',
    position: [0, 1.25, 0.95],
    target: [0, 1.22, 0],
    distance: 0.95
  },
  abdominal: {
    name: 'Abdominal & Visceral',
    position: [0, 0.98, 0.95],
    target: [0, 0.95, 0],
    distance: 0.95
  },
  pelvic: {
    name: 'Pelvic & Urogenital',
    position: [0, 0.75, 0.95],
    target: [0, 0.72, 0],
    distance: 0.95
  }
};

export const CAMERA_PRESETS: Record<'full' | StandardOrganKey, CameraViewPreset> = {
  full: ANATOMICAL_CAMERA_PRESETS.full,
  brain: ANATOMICAL_CAMERA_PRESETS.cranial,
  heart: ANATOMICAL_CAMERA_PRESETS.thoracic,
  liver: ANATOMICAL_CAMERA_PRESETS.abdominal,
  stomach: ANATOMICAL_CAMERA_PRESETS.abdominal,
  kidneys: ANATOMICAL_CAMERA_PRESETS.abdominal
};

export interface LayerVisibility {
  skinShell: boolean;
  skeletonGuide: boolean;
  vascularTree: boolean;
  bloodParticles: boolean;
  organs: boolean;
  stressHeatmap: boolean;
  holoAnnotations: boolean;
  // Deep system layers
  muscles?: boolean;
  nerves?: boolean;
}

export interface DissectionState {
  depth: number; // 0 to 100
  preset: string;
  isolateActive: boolean;
  isolatedKey: string | null;
  transparency: {
    skin: number;
    muscles: number;
    skeleton: number;
    organs: number;
    vessels: number;
    nerves: number;
  };
  systemVisibility: Record<AnatomySystem, boolean>;
}

export interface OrganAnatomicalInfo {
  key: string;
  name: string;
  latinName?: string;
  system: string;
  category?: string;
  fmaId?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  description: string;
  primaryFunction: string;
  clinicalSignificance: string;
  vulnerabilityFactor: string;
}

export const ORGAN_INFO_MAP: Record<string, OrganAnatomicalInfo> = {
  brain: {
    key: 'brain',
    name: 'Brain (Encephalon)',
    latinName: 'Encephalon',
    system: 'Central Nervous System',
    category: 'Neurological',
    fmaId: 'FMA50801',
    position: [0, 1.65, 0],
    description: 'Bilateral cerebral hemispheres with frontotemporal lobes, cerebellum, and neurovascular microcirculation guarded by the tight junctions of the Blood-Brain Barrier (BBB).',
    primaryFunction: 'Cognitive regulation, neurotransmission, autonomic neurocardiac regulation.',
    clinicalSignificance: 'Lipophilic xenobiotics cross the BBB, inducing acute CNS toxicity, hyper-excitability, extrapyramidal symptoms, seizures, or sedation.',
    vulnerabilityFactor: 'High metabolic requirement (20% of resting oxygen consumption) and vulnerability to ischemia and neurochemical receptor overstimulation.'
  },
  brainstem: {
    key: 'brainstem',
    name: 'Brainstem',
    latinName: 'Truncus encephali',
    system: 'Central Nervous System',
    category: 'Neurological',
    fmaId: 'FMA61993',
    description: 'Comprises medulla oblongata, pons, and midbrain. Houses critical autonomic respiratory and vasomotor pacing nuclei.',
    primaryFunction: 'Regulation of respiration, heart rate, blood pressure, and cranial nerve reflexes.',
    clinicalSignificance: 'Vulnerable to severe respiratory depression induced by CNS depressants, opioids, and sedative overdoses.',
    vulnerabilityFactor: 'Dense concentration of non-redundant autonomic survival nuclei in a confined space.'
  },
  cerebellum: {
    key: 'cerebellum',
    name: 'Cerebellum',
    latinName: 'Cerebellum',
    system: 'Central Nervous System',
    category: 'Neurological',
    fmaId: 'FMA67944',
    description: 'Dorsal infratentorial structure with tightly folded cerebellar cortex and deep cerebellar nuclei.',
    primaryFunction: 'Motor coordination, balance, and precision fine-motor calibration.',
    clinicalSignificance: 'Susceptible to neurotoxic ataxia, alcohol intoxication, and antiepileptic drug toxicity (e.g. phenytoin cerebellar atrophy).',
    vulnerabilityFactor: 'High Purkinje cell density and susceptibility to excitotoxicity and oxidative stress.'
  },
  heart: {
    key: 'heart',
    name: 'Heart (Cor)',
    latinName: 'Cor',
    system: 'Cardiovascular System',
    category: 'Cardiovascular',
    fmaId: 'FMA7088',
    position: [0.04, 1.25, 0.05],
    description: 'Four-chambered muscular pump featuring left ventricular myocardium, ascending aortic root, coronary arterial circulation, and conductive Purkinje fibers.',
    primaryFunction: 'Maintains systemic perfusion hemodynamics, generating cardiac output (~5.0 L/min).',
    clinicalSignificance: 'Subject to hERG potassium channel blockade (QTc prolongation, Torsades de Pointes) and free-radical cardiomyocyte lipid peroxidation (e.g. Doxorubicin cardiotoxicity).',
    vulnerabilityFactor: 'Terminally differentiated cardiomyocytes have virtually zero regenerative capacity; cumulative toxic damage leads to irreversible cardiomyopathy.'
  },
  aorta: {
    key: 'aorta',
    name: 'Aorta',
    latinName: 'Aorta',
    system: 'Cardiovascular System',
    category: 'Cardiovascular',
    fmaId: 'FMA3734',
    description: 'Primary systemic arterial trunk originating from the left ventricle, branching into ascending aorta, aortic arch, thoracic aorta, and abdominal aorta.',
    primaryFunction: 'Conveys oxygenated, drug-laden blood from the left ventricle into systemic capillary beds.',
    clinicalSignificance: 'High shear stress vessel susceptible to hypertensive strain, drug-induced vasospasm, and aneurysmal remodeling.',
    vulnerabilityFactor: 'Subject to peak hemodynamic pulsatile pressures and shear-mediated endothelial activation.'
  },
  coronary_arteries: {
    key: 'coronary_arteries',
    name: 'Coronary Arteries',
    latinName: 'Arteriae coronariae',
    system: 'Cardiovascular System',
    category: 'Cardiovascular',
    fmaId: 'FMA3946',
    description: 'Left and right coronary arterial networks arising from the aortic sinuses to supply the myocardial capillary beds.',
    primaryFunction: 'Myocardial oxygen and nutrient delivery during ventricular diastole.',
    clinicalSignificance: 'Vulnerable to drug-induced vasospasm (e.g. ergotamines, cocaine, 5-FU), ischemia, and microvascular thrombosis.',
    vulnerabilityFactor: 'Pure end-arterial circulation with minimal collateral redundancy during acute vasospasm.'
  },
  liver: {
    key: 'liver',
    name: 'Liver (Hepar)',
    latinName: 'Hepar',
    system: 'Hepatobiliary / Metabolic System',
    category: 'Digestive',
    fmaId: 'FMA7197',
    position: [-0.08, 1.08, 0.04],
    description: 'Largest metabolic visceral organ receiving dual vascular supply via the portal vein (75%) and hepatic artery (25%). Contains lobular hepatocyte cords.',
    primaryFunction: 'Phase I CYP450 oxidation, Phase II glucuronidation, sulfation, and glutathione conjugation; biliary excretion.',
    clinicalSignificance: 'Primary target of drug-induced liver injury (DILI). Overdose saturates Phase II pathways, depleting Glutathione (GSH) and freeing toxic reactive electrophiles (e.g. NAPQI).',
    vulnerabilityFactor: 'Centrilobular zone 3 hepatocytes express highest levels of CYP2E1, suffering concentrated oxidative necrosis in overdose.'
  },
  gallbladder: {
    key: 'gallbladder',
    name: 'Gallbladder',
    latinName: 'Vesica biliaris',
    system: 'Hepatobiliary System',
    category: 'Digestive',
    fmaId: 'FMA7202',
    description: 'Pear-shaped muscular sac nestled under the right hepatic lobe that concentrates and stores bile.',
    primaryFunction: 'Concentration and neurohormonal ejection of bile into the duodenum for lipid digestion.',
    clinicalSignificance: 'Elimination route for high molecular weight glucuronide conjugates (enterohepatic recirculation). Susceptible to drug-induced biliary sludging (e.g. ceftriaxone).',
    vulnerabilityFactor: 'High concentration of xenobiotic biliary metabolites exposes epithelium to chemical irritation.'
  },
  lung_l: {
    key: 'lung_l',
    name: 'Left Lung (Pulmo Sinister)',
    latinName: 'Pulmo sinister',
    system: 'Respiratory System',
    category: 'Respiratory',
    fmaId: 'FMA7310',
    position: [0.1, 1.25, 0.02],
    description: 'Two-lobed respiratory organ with cardiac notch, containing extensive alveolar-capillary surface area (~100 m²).',
    primaryFunction: 'Gas exchange (O2 uptake and CO2 elimination) and pulmonary metabolic filtration.',
    clinicalSignificance: 'Target of drug-induced pneumonitis, pulmonary fibrosis (e.g. bleomycin, amiodarone, busulfan), and acute respiratory distress syndrome.',
    vulnerabilityFactor: 'High alveolar oxygen tension promotes localized reactive oxygen species (ROS) cascade.'
  },
  lung_r: {
    key: 'lung_r',
    name: 'Right Lung (Pulmo Dexter)',
    latinName: 'Pulmo dexter',
    system: 'Respiratory System',
    category: 'Respiratory',
    fmaId: 'FMA7309',
    position: [-0.1, 1.25, 0.02],
    description: 'Three-lobed pulmonary organ (superior, middle, inferior lobes) accommodating 55% of total pulmonary ventilatory volume.',
    primaryFunction: 'Ventilation-perfusion gas exchange across the thin alveolar basement membrane.',
    clinicalSignificance: 'Susceptible to capillary leak syndrome, eosinophilic pneumonitis, and drug-induced interstitial lung disease.',
    vulnerabilityFactor: 'Massive blood flow receiving 100% of right ventricular cardiac output every minute.'
  },
  stomach: {
    key: 'stomach',
    name: 'Stomach (Gaster)',
    latinName: 'Gaster',
    system: 'Gastrointestinal System',
    category: 'Digestive',
    fmaId: 'FMA7148',
    position: [0.08, 1.12, 0.04],
    description: 'J-shaped muscular organ receiving ingested compounds from the esophagus. Mucosal defense relies on constitutive COX-1 derived prostaglandins.',
    primaryFunction: 'Acid breakdown, mechanical churn, and primary site of oral drug dissolution and initial enteral absorption.',
    clinicalSignificance: 'NSAID inhibition of COX-1 impairs mucosal prostaglandin synthesis, precipitating acute gastric erosions, ulceration, and catastrophic gastrointestinal hemorrhage.',
    vulnerabilityFactor: 'Direct luminal contact with highly concentrated oral drugs within a low-pH (1.5-2.0) hydrochloric acid environment.'
  },
  small_intestine: {
    key: 'small_intestine',
    name: 'Small Intestine',
    latinName: 'Intestinum tenue',
    system: 'Gastrointestinal System',
    category: 'Digestive',
    fmaId: 'FMA7200',
    description: 'Duodenum, jejunum, and ileum featuring microscopic villi and microvilli presenting ~30 m² of absorptive surface.',
    primaryFunction: 'Primary site of systemic xenobiotic and nutrient absorption via passive diffusion and active transport.',
    clinicalSignificance: 'Rich in enterocyte CYP3A4 and P-glycoprotein (P-gp / ABCB1) efflux transporters, dictating oral bioavailability.',
    vulnerabilityFactor: 'Rapid epithelial cell turnover makes it exquisitely sensitive to antimetabolite chemotherapeutics (e.g. 5-FU, methotrexate).'
  },
  colon: {
    key: 'colon',
    name: 'Large Intestine (Colon)',
    latinName: 'Intestinum crassum',
    system: 'Gastrointestinal System',
    category: 'Digestive',
    fmaId: 'FMA14543',
    description: 'Ascending, transverse, descending, and sigmoid colon hosting trillions of gut microbial symbionts.',
    primaryFunction: 'Water and electrolyte reabsorption; microbial bio-transformation of xenobiotics.',
    clinicalSignificance: 'Bacterial beta-glucuronidases can cleave excreted biliary drug conjugates, regenerating active toxins (e.g. SN-38 from irinotecan, causing severe late diarrhea).',
    vulnerabilityFactor: 'Microbial metabolic interference and long luminal transit times.'
  },
  kidney_l: {
    key: 'kidney_l',
    name: 'Left Kidney (Ren Sinister)',
    latinName: 'Ren sinister',
    system: 'Renal / Excretory System',
    category: 'Renal / Urinary',
    fmaId: 'FMA7204',
    position: [0.09, 1.02, -0.05],
    description: 'Bean-shaped retroperitoneal organ receiving 20-25% of resting cardiac output. Contains ~1 million nephrons.',
    primaryFunction: 'Glomerular ultrafiltration, tubular secretion, and systemic clearance of hydrophilic drugs and polar metabolites.',
    clinicalSignificance: 'Primary target of nephrotoxic injury (e.g. cisplatin, aminoglycosides, contrast dye), leading to acute tubular necrosis (ATN) and acute kidney injury (AKI).',
    vulnerabilityFactor: 'Massive countercurrent concentration gradient exposes tubular epithelial cells to drug concentrations up to 50x higher than plasma.'
  },
  kidney_r: {
    key: 'kidney_r',
    name: 'Right Kidney (Ren Dexter)',
    latinName: 'Ren dexter',
    system: 'Renal / Excretory System',
    category: 'Renal / Urinary',
    fmaId: 'FMA7203',
    position: [-0.09, 0.99, -0.05],
    description: 'Right retroperitoneal kidney situated slightly lower than left due to the liver mass. Essential for volume homeostasis.',
    primaryFunction: 'Glomerular filtration rate (eGFR) maintenance and acid-base / renin-angiotensin-aldosterone balance.',
    clinicalSignificance: 'Renal insufficiency backs up systemic clearance of narrow-therapeutic-index drugs, causing whole-body toxicity cascades.',
    vulnerabilityFactor: 'High metabolic demand of proximal tubule Na+/K+-ATPase pumps makes them vulnerable to mitochondrial toxins.'
  },
  bladder: {
    key: 'bladder',
    name: 'Urinary Bladder',
    latinName: 'Vesica urinaria',
    system: 'Renal / Excretory System',
    category: 'Renal / Urinary',
    fmaId: 'FMA15900',
    position: [0, 0.78, 0.04],
    description: 'Distensible muscular reservoir lined with transitional urothelium that stores urine before micturition.',
    primaryFunction: 'Collection and storage of urine containing excreted hydrophilic drugs and metabolites.',
    clinicalSignificance: 'Vulnerable to hemorrhagic cystitis from reactive urinary metabolites (e.g. acrolein from cyclophosphamide / ifosfamide).',
    vulnerabilityFactor: 'Prolonged contact between stored concentrated urine and transitional epithelium.'
  },
  pancreas: {
    key: 'pancreas',
    name: 'Pancreas',
    latinName: 'Pancreas',
    system: 'Endocrine & Digestive System',
    category: 'Endocrine',
    fmaId: 'FMA7198',
    description: 'Elongated retroperitoneal gland comprising head, body, and tail, possessing both exocrine acini and endocrine islets of Langerhans.',
    primaryFunction: 'Secretion of digestive proenzymes and insulin/glucagon endocrine glucose regulation.',
    clinicalSignificance: 'Subject to drug-induced acute pancreatitis (e.g. azathioprine, GLP-1 analogs, valproate, thiazides).',
    vulnerabilityFactor: 'Premature intraductal zymogen activation can trigger devastating auto-digestive necrotizing pancreatitis.'
  },
  spleen: {
    key: 'spleen',
    name: 'Spleen (Lien)',
    latinName: 'Splen',
    system: 'Immune / Lymphatic System',
    category: 'Immune / Lymphatic',
    fmaId: 'FMA7196',
    description: 'Largest secondary lymphoid organ located in the left hypochondrium, consisting of red pulp and white pulp.',
    primaryFunction: 'Erythrocyte quality control, iron recycling, and adaptive immune antibody synthesis.',
    clinicalSignificance: 'Target of drug-induced immune hemolytic anemia and thrombocytopenia (e.g. heparin-induced thrombocytopenia, HIT).',
    vulnerabilityFactor: 'Specialized cordal blood filtration slows flow, maximizing exposure to immune complexes.'
  },
  skin: {
    key: 'skin',
    name: 'Integumentary Skin Shell',
    latinName: 'Cutis',
    system: 'Integumentary System',
    category: 'Skin',
    fmaId: 'FMA7163',
    description: 'Complete human body external dermal barrier comprising stratified squamous epidermis and vascularized dermis.',
    primaryFunction: 'Physical barrier against pathogens, thermal homeostasis, sensory perception, and transdermal drug absorption.',
    clinicalSignificance: 'Target of severe cutaneous adverse reactions (SCAR), Stevens-Johnson Syndrome (SJS), and toxic epidermal necrolysis (TEN).',
    vulnerabilityFactor: 'Immense surface area and high rate of immune cell patrolling.'
  },
  trachea: {
    key: 'trachea',
    name: 'Trachea (Windpipe)',
    latinName: 'Trachea',
    system: 'Respiratory System',
    category: 'Respiratory',
    fmaId: 'FMA7394',
    description: 'Cartilaginous and membranous tube connecting the larynx to the primary bronchi, supported by C-shaped hyaline cartilage rings.',
    primaryFunction: 'Conduit for air delivery into the lungs; mucociliary clearance of inhaled particulate matter.',
    clinicalSignificance: 'Subject to bronchospasm, mucosal irritation from aerosolized drugs, and inflammatory stenosis.',
    vulnerabilityFactor: 'Ciliated pseudostratified columnar epithelium exposed to high velocity airborne toxins.'
  },
  bronchi: {
    key: 'bronchi',
    name: 'Bronchial Tree',
    latinName: 'Arbor bronchialis',
    system: 'Respiratory System',
    category: 'Respiratory',
    fmaId: 'FMA7405',
    description: 'Bilateral mainstem bronchi branching into secondary lobar, tertiary segmental bronchi, and bronchioles.',
    primaryFunction: 'Ventilatory air conduction and active regulation of airway resistance through smooth muscle tone.',
    clinicalSignificance: 'Target of drug-induced bronchospasm (e.g. non-selective beta-blockers, aspirin-exacerbated respiratory disease, AERD).',
    vulnerabilityFactor: 'Dense beta-2 adrenergic and muscarinic receptor expression governs airway constriction.'
  },
  larynx: {
    key: 'larynx',
    name: 'Larynx (Voice Box)',
    latinName: 'Larynx',
    system: 'Respiratory System',
    category: 'Respiratory',
    fmaId: 'FMA55000',
    description: 'Complex cartilaginous organ guarding the entrance to the lower respiratory tract, housing the vocal cords.',
    primaryFunction: 'Phonation, airway protection during deglutition, and laryngeal sphincter closure.',
    clinicalSignificance: 'Vulnerable to life-threatening angioedema from ACE inhibitors, mast-cell mediated anaphylaxis, and chemical laryngospasm.',
    vulnerabilityFactor: 'Loose submucosal connective tissue prone to rapid fluid extravasation.'
  },
  adrenal_l: {
    key: 'adrenal_l',
    name: 'Left Adrenal Gland',
    latinName: 'Glandula suprarenalis sinistra',
    system: 'Endocrine System',
    category: 'Endocrine',
    fmaId: 'FMA9608',
    description: 'Crescent-shaped endocrine organ capping the superior pole of the left kidney, divided into cortex and medulla.',
    primaryFunction: 'Synthesis of mineralocorticoids (aldosterone), glucocorticoids (cortisol), and catecholamines (epinephrine).',
    clinicalSignificance: 'Subject to secondary adrenal suppression from chronic corticosteroids and drug-induced adrenalitis.',
    vulnerabilityFactor: 'Extremely rich capillary microcirculation delivering concentrated xenobiotics.'
  },
  adrenal_r: {
    key: 'adrenal_r',
    name: 'Right Adrenal Gland',
    latinName: 'Glandula suprarenalis dextra',
    system: 'Endocrine System',
    category: 'Endocrine',
    fmaId: 'FMA9607',
    description: 'Pyramidal endocrine gland situated superior to the right kidney, essential for stress adaptation.',
    primaryFunction: 'Steroidogenesis and autonomic sympathoadrenal stress response.',
    clinicalSignificance: 'Adrenal insufficiency triggers catastrophic vascular collapse and refractory hypotension.',
    vulnerabilityFactor: 'High metabolic rate and intracellular lipid droplet accumulation of lipophilic compounds.'
  },
  pituitary: {
    key: 'pituitary',
    name: 'Pituitary Gland (Hypophysis)',
    latinName: 'Hypophysis',
    system: 'Endocrine System',
    category: 'Endocrine',
    fmaId: 'FMA13889',
    description: 'Master neuroendocrine gland situated in the sella turcica of the sphenoid bone, regulated by hypothalamic hormones.',
    primaryFunction: 'Secretion of ACTH, TSH, GH, prolactin, LH, FSH, oxytocin, and vasopressin (ADH).',
    clinicalSignificance: 'Target of drug-induced hypophysitis from immune checkpoint inhibitors (e.g. ipilimumab, nivolumab).',
    vulnerabilityFactor: 'Fenestrated capillary network outside the typical blood-brain barrier.'
  },
  thymus: {
    key: 'thymus',
    name: 'Thymus',
    latinName: 'Thymus',
    system: 'Immune / Lymphatic System',
    category: 'Immune / Lymphatic',
    fmaId: 'FMA9606',
    description: 'Specialized primary lymphoid organ located in the anterior superior mediastinum.',
    primaryFunction: 'Maturation and positive/negative selection of antigen-specific T-lymphocytes.',
    clinicalSignificance: 'Sensitive to immunosuppressive xenobiotics, antineoplastic agents, and corticosteroid-induced thymic involution.',
    vulnerabilityFactor: 'High rate of thymocyte proliferation and programmed apoptosis.'
  },
  ureter_l: {
    key: 'ureter_l',
    name: 'Left Ureter',
    latinName: 'Ureter sinister',
    system: 'Urinary System',
    category: 'Renal / Urinary',
    fmaId: 'FMA15901',
    description: 'Muscular tubular conduit conveying urine from the left renal pelvis into the urinary bladder via peristalsis.',
    primaryFunction: 'Unidirectional peristaltic transport of concentrated urine and eliminated drug metabolites.',
    clinicalSignificance: 'Susceptible to obstruction from crystalluria (e.g. high-dose methotrexate, acyclovir, sulfadiazine, indinavir).',
    vulnerabilityFactor: 'Narrow luminal diameter at ureterovesical junction predisposes to crystal impaction.'
  },
  ureter_r: {
    key: 'ureter_r',
    name: 'Right Ureter',
    latinName: 'Ureter dexter',
    system: 'Urinary System',
    category: 'Renal / Urinary',
    fmaId: 'FMA15902',
    description: 'Retroperitoneal muscular tube propelling urine from right kidney to bladder.',
    primaryFunction: 'Peristaltic drainage of renal ultrafiltrate and clearance products.',
    clinicalSignificance: 'Crystalluria precipitates renal colic, acute post-renal obstruction, and hydronephrosis.',
    vulnerabilityFactor: 'High local concentration of insoluble excreted metabolites.'
  }
};

// Aliases for unified organ access
ORGAN_INFO_MAP.kidneys = ORGAN_INFO_MAP.kidney_l;
