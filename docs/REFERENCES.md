# Scientific references

| Source | Use in this application |
|---|---|
| [US FDA clinical pharmacology review, NDA 21-087](https://www.accessdata.fda.gov/drugsatfda_docs/nda/99/21087_Tamiflu_bior.pdf), printed page 35, Table 1 and Figure 1 | Treatment A is the acetaminophen-alone arm after one 500 mg tablet. Table 1 gives mean individual Cmax of 7.16 µg/mL. Figure 1 provides the comparison points. |
| [IARC monograph, Paracetamol, pharmacokinetics](https://www.ncbi.nlm.nih.gov/books/NBK526213/) | Reports systemic availability of approximately 68% at 500 mg and describes dose dependence. The model uses 0.68 for every oral paracetamol scenario as an explicit simplification. |
| [McGill et al., acetaminophen adducts and metabolites](https://pmc.ncbi.nlm.nih.gov/articles/PMC4553102/) | Provides biological context for oxidation to NAPQI, reaction with glutathione, and competing protein binding. The implementation uses a fixed 8% of systemic hepatic elimination as an illustrative oxidation fraction within the reported 5–10% range. |
| [PubChem, acetaminophen CID 1983](https://pubchem.ncbi.nlm.nih.gov/compound/1983) | Molecular identity and molar mass. The simulator uses 151.16 g/mol to convert parent-drug flux to molar demand. |

The remaining catalog coefficients originated in the supplied project. The archive supplied no traceable individual source for them. Treat them as teaching inputs. Their values and units appear in MODEL_ASSUMPTIONS.md. The validation dataset was used for external comparison only.

## Additional comparison and ML sources

- Portolés et al. (2003), doi:10.1016/S0011-393X(03)00110-3. Human oral 500 mg reference/test formulation comparison, 24 volunteers, plasma HPLC, sampling through 14 h. https://pmc.ncbi.nlm.nih.gov/articles/PMC4053016/
- PKSmart human PK dataset, retrieved from https://raw.githubusercontent.com/srijitseal/PKSmart/main/data/Human_PK_data.csv . Snapshot, source SHA-256, grouping, metrics, and limitations are recorded in data/research/evaluation.json. Repository license is preserved in data/research/PKSmart-LICENSE. Underlying experimental records may carry additional source conditions.
- PubChem identity and molecular descriptor lookup through PUG REST. https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
- Anatomy GLB hashes match the installed open-anatomy-3d package files. Credits and model license are distributed in public/models and visible in Methods & evidence.
