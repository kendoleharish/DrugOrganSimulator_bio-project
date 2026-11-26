import { observedPlasma, referenceApplies, validationMetrics } from '../../engine/validation';
import { memo, useState } from 'react';
import type { SimulationResult } from '../../engine/types';

interface Props {
  result: SimulationResult;
  comparison?: SimulationResult;
  label?: string;
}

export const PlasmaChart = memo(function PlasmaChart({ result, comparison, label = 'Simulation' }: Props) {
  const [logScale, setLogScale] = useState(false);
  const measured = !comparison && referenceApplies(result);
  const metrics = measured ? validationMetrics(result) : null;
  const maximum = Math.max(result.cMax, comparison?.cMax ?? 0, 0.1);
  const width = 244;
  const height = 85;
  const axisLeft = 37;
  const axisBottom = 103;
  const end = result.totalDurationHours;
  const x = (time: number) => axisLeft + time / end * width;
  const floor = maximum / 1000;
  const y = (value: number) => axisBottom - (logScale
    ? Math.log10(Math.max(value, floor) / floor) / 3
    : value / maximum) * height;
  const tickValue = (fraction: number) => logScale ? floor * 10 ** (3 * fraction) : maximum * fraction;
  const series = (run: SimulationResult) => run.timeline.map(point =>
    x(point.timeHours).toFixed(2) + ',' + y(point.plasmaConcentrationMgL).toFixed(2)).join(' ');
  return <figure className="plasma-chart">
    <figcaption>Plasma concentration <span>(mg/L)</span></figcaption>
    <button type="button" className="workspace-toggle" aria-pressed={logScale} onClick={() => setLogScale(value => !value)}>{logScale ? 'Log scale' : 'Linear scale'}</button>
    <svg viewBox="0 0 300 138" role="img" aria-label={'Simulated plasma concentration over ' + end + ' hours'}>
      {[0, 0.5, 1].map(f => <g key={f}>
        <line x1={axisLeft} x2={x(end)} y1={y(tickValue(f))} y2={y(tickValue(f))} stroke="#465665" strokeWidth=".6"/>
        <text x={axisLeft-4} y={y(tickValue(f))+3} textAnchor="end" fill="currentColor" fontSize="9">{tickValue(f).toPrecision(2)}</text>
      </g>)}
      {[0,0.25,0.5,0.75,1].map(f => <text key={f} x={x(end*f)} y="118" textAnchor="middle" fill="currentColor" fontSize="9">{end*f}</text>)}
      <text x="159" y="133" textAnchor="middle" fill="currentColor" fontSize="10">Time after first dose (h)</text>
      <polyline points={series(result)} fill="none" stroke="#8cbbff" strokeWidth="2"/>
      {comparison && <polyline points={series(comparison)} fill="none" stroke="#d5a565" strokeWidth="2" strokeDasharray="4 2"/>}
      {measured && observedPlasma.map(point => <circle key={point.timeHours} cx={x(point.timeHours)} cy={y(point.concentrationMgL)} r="3" fill="#f0bd83"/>)}
    </svg>
    <small><span style={{color:'#8cbbff'}}>━</span> {label} {comparison && <><span style={{color:'#d5a565'}}>┄</span> Mouse simulation</>}</small>
    {metrics && <small>● FDA study means (digitized, 3–5 h) · RMSE {metrics.rmseMgL.toFixed(2)} mg/L</small>}
    {logScale && <small>Values below {floor.toPrecision(2)} mg/L are clipped to the display floor.</small>}
    <details><summary>Accessible chart data</summary><table><thead><tr><th>Time (h)</th><th>{label} (mg/L)</th>{comparison && <th>Mouse (mg/L)</th>}</tr></thead><tbody>{result.timeline.filter((_, index) => index % 10 === 0 || index === result.timeline.length - 1).map(point => <tr key={point.timeHours}><td>{point.timeHours.toFixed(1)}</td><td>{point.plasmaConcentrationMgL.toPrecision(4)}</td>{comparison && <td>{comparison.timeline.find(other => Math.abs(other.timeHours - point.timeHours) < 1e-8)?.plasmaConcentrationMgL.toPrecision(4) ?? 'Unavailable'}</td>}</tr>)}</tbody></table><small>Table samples approximately hourly. Full calculated timeline is available in the scenario JSON export.</small></details>
  </figure>;
});
