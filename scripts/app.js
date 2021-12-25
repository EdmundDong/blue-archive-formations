Vue.config.devtools = true
const Airtable = require('airtable')
const base = new Airtable({ apiKey: 'keyLfkfBG43VXN52y' }).base('app24peMma4LiqxIh')
const columns = ['Student', 'Overall Tier', 'PVP Tier', 'Raid Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const columnsOverall = ['Student', 'Overall Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const columnsPvp = ['Student', 'PVP Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const columnsRaid = ['Student', 'Raid Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const modes = ['Overall', 'PVP', 'Raid']

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
            })
            fetchNextPage()
        }, function done(err) {
            if (err) { reject(err) } else { resolve(students) }
        })
    })
}

function applySynergy(students, weak, resist) {
    for (const student in students) {
        if (students[student]['ATK Type'] == weak) {
            students[student]['ATK'] *= 2
            for (const mode in modes) {
                students[student][modes[mode] + ' Tier'] -= 1
            }
        } else if (students[student]['ATK Type'] == resist) {
            students[student]['ATK'] /= 2
            for (const mode in modes) {
                students[student][modes[mode] + ' Tier'] += 1
            }
        }
    }
}

function formation(data, defEnemy = 'Overall', type = 'Overall', nTeams = 1) {
    const students = JSON.parse(JSON.stringify(data))
    if (defEnemy === 'light') {
        applySynergy(students, 'Explosive', 'Piercing')
    } else if (defEnemy === 'heavy') {
        applySynergy(students, 'Piercing', 'Mystic')
    } else if (defEnemy === 'special') {
        applySynergy(students, 'Mystic', 'Explosive')
    }
    students.sort((a, b) => a[type + ' Tier'] - b[type + ' Tier'] || b['ATK'] - a['ATK'])
    return students
}

async function main() {
    const students = await formation(await pullData())

    // Overall
    console.log('Overall', students)
    const light = await formation(students, 'light')
    console.log('Overall Light', light)
    const heavy = await formation(students, 'heavy')
    console.log('Overall Heavy', heavy)
    const special = await formation(students, 'special')
    console.log('Overall Special', special)

    // PVP
    const pvp = await formation(students, 'PVP')
    console.log('PVP', pvp)

    // Raid
    const raidHeavy = await formation(students, 'light', 'Raid')
    console.log('Raid Heavy', raidHeavy)
    const raidLight = await formation(students, 'heavy', 'Raid')
    console.log('Raid Light', raidLight)
    const raidSpecial = await formation(students, 'special', 'Raid')
    console.log('Raid Special', raidSpecial)

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

    new Vue({
        el: '#ba-teams',
        data: {
            tables: [
                { classes: 'ba-team overall', headers: columnsOverall, rows: students, tags: students.map(student => student['ATK Type']) },
                { classes: 'ba-team overall light', headers: columnsOverall, rows: light, tags: light.map(student => student['ATK Type']) },
                { classes: 'ba-team overall heavy', headers: columnsOverall, rows: heavy, tags: heavy.map(student => student['ATK Type']) },
                { classes: 'ba-team overall special', headers: columnsOverall, rows: special, tags: special.map(student => student['ATK Type']) },
                { classes: 'ba-team pvp', headers: columnsPvp, rows: pvp, tags: pvp.map(student => student['ATK Type']) },
                { classes: 'ba-team raid light', headers: columnsRaid, rows: raidLight, tags: raidLight.map(student => student['ATK Type']) },
                { classes: 'ba-team raid heavy', headers: columnsRaid, rows: raidHeavy, tags: raidHeavy.map(student => student['ATK Type']) },
                { classes: 'ba-team raid special', headers: columnsRaid, rows: raidSpecial, tags: raidSpecial.map(student => student['ATK Type']) }
            ]
        }
    })
}

main()