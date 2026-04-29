// ONLY showing the INPUT SECTION changes for clarity

<h2>Tech Entry</h2>

<label>Bus Number</label><br />
<input
  value={busNumber}
  onChange={(e) => setBusNumber(e.target.value)}
/>

<br /><br />

<label>Part Being Replaced</label><br />
<input
  value={partName}
  onChange={(e) => setPartName(e.target.value)}
/>

<br /><br />

<label>Part # Requiring Modification</label><br />
<input
  value={modifiedPartNumber}
  onChange={(e) => setModifiedPartNumber(e.target.value)}
/>

<br /><br />

<label>Direct-Fit Part #</label><br />
<input
  value={directFitPartNumber}
  onChange={(e) => setDirectFitPartNumber(e.target.value)}
/>

<br /><br />

<label>Modified Part Cost</label><br />
<input
  type="number"
  value={modifiedPartCost}
  onChange={(e) => setModifiedPartCost(e.target.value)}
/>

<br /><br />

<label>Direct-Fit Part Cost</label><br />
<input
  type="number"
  value={directFitPartCost}
  onChange={(e) => setDirectFitPartCost(e.target.value)}
/>

<br /><br />

<label>Labor Rate ($/hr)</label><br />
<input
  type="number"
  value={laborRate}
  onChange={(e) => setLaborRate(e.target.value)}
/>

<br /><br />

<label>Supplies Cost</label><br />
<input
  type="number"
  value={suppliesCost}
  onChange={(e) => setSuppliesCost(e.target.value)}
/>

<br /><br />

<label>Clock In</label><br />
<input
  type="datetime-local"
  value={clockIn}
  onChange={(e) => setClockIn(e.target.value)}
/>
<button onClick={() => setClockIn(nowLocal())}>Now</button>

<br /><br />

<label>Clock Out</label><br />
<input
  type="datetime-local"
  value={clockOut}
  onChange={(e) => setClockOut(e.target.value)}
/>
<button onClick={() => setClockOut(nowLocal())}>Now</button>

<br /><br />

<label>Modification Comments</label><br />
<textarea
  value={comments}
  onChange={(e) => setComments(e.target.value)}
/>

<br /><br />

<label>Materials Used</label><br />
<textarea
  value={materialsUsed}
  onChange={(e) => setMaterialsUsed(e.target.value)}
/>