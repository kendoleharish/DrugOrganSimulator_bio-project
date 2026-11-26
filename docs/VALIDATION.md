# Validation record

## Reproduce the experiment

Use Node.js and run `npm ci`, then `npm test` and `npm run validate`. The validation command runs a single oral paracetamol simulation with 500 mg input, the 70 kg baseline human scenario, and 24 hours of observation. It prints external comparison metrics and one-at-a-time perturbations.

## Comparison against human plasma data

The FDA review for NDA 21-087 reports a 500 mg oral acetaminophen-alone arm. The 3, 4 and 5 hour observations below were read visually from Figure 1, printed page 35. The graph has a linear time axis and logarithmic concentration axis. The two treatment curves nearly overlap at the selected points. Precision is limited by raster resolution and marker width. Early overlapping markers and the divergent terminal branches were excluded from digitization. The sample is deliberately limited to the descending limb. One µg/mL equals one mg/L. [Original FDA review](https://www.accessdata.fda.gov/drugsatfda_docs/nda/99/21087_Tamiflu_bior.pdf)

| Time (h) | Approximate published mean (mg/L) | Simulated (mg/L) |
|---:|---:|---:|
| 3 | 2.6 | 2.59 |
| 4 | 1.8 | 1.98 |
| 5 | 1.4 | 1.49 |

The three-point mean absolute error is 0.093 mg/L. Root mean square error is 0.116 mg/L. These metrics average equally weighted errors at matching times. They do not measure the accuracy of the entire curve.

**The peak is materially underestimated.** Table 1 reports a mean individual peak of 7.16 mg/L, while the model peaks at 3.45 mg/L at 1.4 hours. The signed difference is −3.71 mg/L, about −52%. A mean of subjects’ individual peaks may exceed the peak of their mean curve. Formulation, absorption variability, distribution and assumed coefficients may also contribute. There was no fitting to individual observations or prospective test set.

## Sensitivity

Each parameter below was changed independently by ±20%, with all others fixed. The entries give simulated peak concentration in mg/L.

| Parameter | −20% | +20% |
|---|---:|---:|
| Absorption rate | 3.25 | 3.60 |
| Apparent volume per kg | 4.07 | 3.00 |
| Hepatic clearance | 3.62 | 3.30 |
| Oral availability | 2.76 | 4.14 |

These deterministic scenarios describe local sensitivity around one baseline. Population distributions and statistical confidence intervals would need additional data.

## Engineering tests

The automated checks cover conservation of administered mass, nonnegative finite state, monoexponential IV decay, the coincident absorption/elimination-rate limit, fractional repeat intervals, zero dose, invalid parameter rejection, dose counting, steady-state detection, and absence of a paracetamol-specific mechanism in other drugs or species. These checks passed in the delivered workspace. There are no measurements validating tissue-level concentrations, GSH demand, local effects, any mouse prediction or the other drug profiles.
