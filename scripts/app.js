var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keyLfkfBG43VXN52y' }).base('app24peMma4LiqxIh');

Vue.config.devtools = true
columns = ["Student", "Overall Tier", "PVP Tier", "Raid Tier","ATK Type", "DEF Type", "Role", "Class", "DPS"]
students = []

async function pullData() {
  await base('Tiers and Roster').select({
    view: "Have",
    fields: columns
  }).eachPage(function page(records, fetchNextPage) {
    records.forEach(function (record) {
      console.log('Retrieved', record.fields.Student);
      students.push(record.fields);
    });
    fetchNextPage();
  }, function done(err) {
    if (err) { console.error(err); return; }
  });
  return students
}

var allTable = new Vue({
  el: '#allTable',
  data: {
    students: students,
    headers: columns
  }
})
heavy = []
function heavyFormation() {
  pullData()
  console.log('Students', students);
  let copy = students.slice();
  console.log('Heavy Formation', copy);
  var result = students.filter(country => country.Student === 'Iori')
  console.log('Heavy Formation', result);
  heavy = result
  return result
}

heavyFormation()
console.log('Heavy Formation', heavy);
var heavyTable = new Vue({
  el: '#heavyTable',
  data: {
    students: heavy,
    headers: columns
  }
})

console.log('Heavy Formation', heavy);

var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})