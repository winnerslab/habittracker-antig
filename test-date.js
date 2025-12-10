const dates = ["2025-12-10", "2025-12-01"];
dates.forEach(d => {
    const dateObj = new Date(d);
    console.log(`String: ${d}`);
    console.log(`UTC: ${dateObj.toISOString()}`);
    console.log(`Local getDate(): ${dateObj.getDate()}`);
    console.log(`Timezone Offset: ${dateObj.getTimezoneOffset()}`);
});
