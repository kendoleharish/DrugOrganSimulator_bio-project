# Model assumptions

InSilico-3D couples a simplified systemic PK model to a whole-body anatomical atlas. Only the oral depot and central parent-drug compartment have kinetic state. Liver and kidneys are elimination pathways. Every other organ is shown for anatomical context.

## Equations and units

Let G and A denote depot and central amounts in mg, V apparent distribution volume in L, and C = A/V in mg/L. For elapsed time in hours, dG/dt = −ka G and dA/dt = F ka G − (CLh + CLr) C. The engine integrates these linear equations analytically between administration events and display samples. The central volume includes distribution into lumped tissues. It differs from blood volume.

Oral input enters G and instantaneous IV input enters A. The unabsorbed or presystemically removed fraction accumulates separately. Cumulative mass in systemic hepatic and renal elimination is allocated by clearance shares. The sum of both compartments, both elimination pathways and presystemic loss should equal cumulative input. Display colors encode shares of cumulative administered parent-drug mass. A liver or kidney color conveys cumulative elimination. It cannot be interpreted as local concentration or injury. Left and right kidney meshes share one whole-kidney value.

## Input register

| Profile | ka (1/h) | V (L/kg) | Hepatic clearance (L/h) | Renal clearance (L/h) | F for oral route |
|---|---:|---:|---:|---:|---:|
| Paracetamol | 1.5 | 0.95 | 18 | 1.2 | 0.68 |
| Ibuprofen | 1.1 | 0.15 | 3.5 | 0.5 | 1, assumed |
| Caffeine | 2.2 | 0.60 | 5.4 | 0.3 | 1, assumed |
| Doxorubicin | unused for IV | 25 | 30 | 4.5 | IV only |

The clearances are reference-human values. See REFERENCES.md for F and molar mass provenance. The remaining coefficients are inherited scenarios. The one-compartment assumption overlooks binding dynamics, multiphasic distribution, regional perfusion and saturable metabolism. The IV option represents an instantaneous mathematical input. No drug infusion protocol is represented.

## Paracetamol pathway

Only human paracetamol simulations compute the illustrative NAPQI pathway. Oxidation rate in µmol/h = 0.08 × CLh × C × 1000 / 151.16. One mole of GSH per mole of NAPQI gives the stoichiometric demand under complete conjugation. Presystemic loss is unpartitioned. The model has no calibrated intracellular GSH pool, synthesis, competing protein adduction or tissue injury kinetics. The fraction is fixed across scenarios. Extending the display to larger model inputs cannot validate an overdose prediction.

## Event timing and scaling

Doses enter at time zero and on interval boundaries strictly before the end of observation. Samples at dose times show post-dose state. Peak concentration is the maximum across 0.1-hour samples and administration events. Steady state requires two successive comparisons between pre-dose state vectors to meet 1% relative tolerance for both amounts (with a small scale floor). This convention can miss convergence in a short experiment.

Human and mouse teaching masses are 70 kg and 0.025 kg. Equal mg/kg doses and mass-proportional apparent volume are used. Absolute clearance is scaled by mass ratio to the 0.75 power. Absorption is held constant. Human scenario modifiers multiply hepatic or renal clearance. The low-hepatic scenario uses 0.35, the low-renal scenario uses 0.25 and the combined scenario uses 0.70 and 0.60 respectively. The multipliers illustrate sensitivity. They have no calibration to age, genotype, GFR or animal data.
