Vue.config.devtools = true
const Airtable = require('airtable');
const base = new Airtable({ apiKey: 'keyLfkfBG43VXN52y' }).base('app24peMma4LiqxIh');
const columns = ['Student', 'Overall Tier', 'PVP Tier', 'Raid Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const columnsOverall = ['Student', 'Overall Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const columnsPvp = ['Student', 'PVP Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const columnsRaid = ['Student', 'Raid Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']

function pullData() {
    return new Promise((resolve, reject) => {
        const students = []
        base('Tiers and Roster').select({
            view: 'Have',
            fields: columns
        }).eachPage(function page(records, fetchNextPage) {
            records.forEach(record => {
                console.log('Retrieved', record.fields.Student)
                students.push(record.fields)
            });
            fetchNextPage();
        }, function done(err) {
            if (err) { reject(err); } else { resolve(students); }
        });
    });
}

function applySynergy (students, resist, weak) {
    for (const student in students) {
        if (students[student]['ATK Type'] == resist) {
            students[student]['ATK'] /= 2
            students[student]['Overall Tier'] += 1
            students[student]['PVP Tier'] += 1
            students[student]['Raid Tier'] += 1
        } else if (students[student]['ATK Type'] == weak) {
            students[student]['ATK'] *= 2
            students[student]['Overall Tier'] -= 1
            students[student]['PVP Tier'] -= 1
            students[student]['Raid Tier'] -= 1
        }
    }
}

function form(data, tier='Overall') {
    const students = JSON.parse(JSON.stringify(data));
    students.sort((a, b) => a[tier + ' Tier'] - b[tier + ' Tier'] || b['ATK'] - a['ATK'])
    return students
}

function formHeavy(data, tier='Overall') {
    const students = JSON.parse(JSON.stringify(data));
    applySynergy(students, 'Piercing', 'Explosive')
    students.sort((a, b) => a[tier + ' Tier'] - b[tier + ' Tier'] || b['ATK'] - a['ATK'])
    return students
}

function formLight(data, tier='Overall') {
    const students = JSON.parse(JSON.stringify(data));
    applySynergy(students, 'Mystic', 'Piercing')
    students.sort((a, b) => a[tier + ' Tier'] - b[tier + ' Tier'] || b['ATK'] - a['ATK'])
    return students
}

function formSpecial(data, tier='Overall') {
    const students = JSON.parse(JSON.stringify(data));
    applySynergy(students, 'Explosive', 'Mystic')
    students.sort((a, b) => a[tier + ' Tier'] - b[tier + ' Tier'] || b['ATK'] - a['ATK'])
    return students
}

async function main() {
    const students = await form(await pullData())

    // Overall
    console.log('Overall', students)
    const heavy = await formHeavy(students)
    console.log('Overall Heavy', heavy)
    const light = await formLight(students)
    console.log('Overall Light', heavy)
    const special = await formSpecial(students)
    console.log('Overall Special', heavy)

    // PVP
    const pvp = await form(students, 'PVP')
    console.log('PVP', pvp)
    
    // Raid
    const raidHeavy = await formHeavy(students, 'Raid')
    console.log('Raid Heavy', heavy)
    const raidLight = await formLight(students, 'Raid')
    console.log('Raid Light', heavy)
    const raidSpecial = await formSpecial(students, 'Raid')
    console.log('Raid Special', heavy)

    new Vue({
        el: '#ba-tables',
        data: {
            tables: [
                { classes: 'ba-table overall', headers: columnsOverall, rows: students, tags: students.map(student => student['ATK Type']) },
                { classes: 'ba-table overall light', headers: columnsOverall, rows: light, tags: light.map(student => student['ATK Type']) },
                { classes: 'ba-table overall heavy', headers: columnsOverall, rows: heavy, tags: heavy.map(student => student['ATK Type']) },
                { classes: 'ba-table overall special', headers: columnsOverall, rows: special, tags: special.map(student => student['ATK Type']) },
                { classes: 'ba-table pvp', headers: columnsPvp, rows: pvp, tags: pvp.map(student => student['ATK Type']) },
                { classes: 'ba-table raid light', headers: columnsRaid, rows: raidLight, tags: raidLight.map(student => student['ATK Type']) },
                { classes: 'ba-table raid heavy', headers: columnsRaid, rows: raidHeavy, tags: raidHeavy.map(student => student['ATK Type']) },
                { classes: 'ba-table raid special', headers: columnsRaid, rows: raidSpecial, tags: raidSpecial.map(student => student['ATK Type']) }
            ]
        }
    })
}

main()