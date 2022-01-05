Vue.config.devtools = true
const Airtable = require('airtable')
const base = new Airtable({ apiKey: 'keyLfkfBG43VXN52y' }).base('app24peMma4LiqxIh')
const columns = ['Student', 'Overall Tier', 'PVP Tier', 'Raid Tier', 'Academy', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const columnsOverall = ['Student', 'Overall Tier', 'Academy', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const columnsPvp = ['Student', 'PVP Tier', 'Academy', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const columnsRaid = ['Student', 'Raid Tier', 'Academy', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
const modes = ['Overall', 'PVP', 'Raid']
const nTeams = [1, 2]

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
        if (students[student]['ATK Type'] === weak) {
            students[student]['ATK'] *= 2
            for (const mode in modes) {
                students[student][modes[mode] + ' Tier'] -= 1
            }
        } else if (students[student]['ATK Type'] === resist) {
            students[student]['ATK'] /= 2
            for (const mode in modes) {
                students[student][modes[mode] + ' Tier'] += 1
            }
        }
    }
}

function formation(data, defEnemy = 'Overall', environment = 'Overall', type = 'Overall') {
    // Resort students based on synergy
    const students = JSON.parse(JSON.stringify(data))
    switch (defEnemy) {
        case ('light'):
            applySynergy(students, 'Explosive', 'Piercing')
            break
        case ('heavy'):
            applySynergy(students, 'Piercing', 'Mystic')
            break
        case ('special'):
            applySynergy(students, 'Mystic', 'Explosive')
    }
    switch (environment) {
        case ('light'):
            break
        case ('heavy'):
            break
        case ('special'):
    }
    students.sort((a, b) => a[type + ' Tier'] - b[type + ' Tier'] || b['ATK'] - a['ATK'])
    // Form teams
    const nTeams = 4
    let teams = []
    let tanks = students.filter(student => student['Class'] === 'Tank')
    let strikers = students.filter(student => student['Class'] != 'Tank' && student['Role'] === 'Striker')
    let healers = students.filter(student => student['Student'] === 'Serina' || student['Student'] === 'Hanae')
    let specials = students.filter(student => student['Class'] != 'Healer' && student['Role'] === 'Special')
    for (let loop = 0; loop < nTeams; loop++) {
        if (type === 'Raid') {
            teams.push(strikers.shift())
        } else {
            teams.push(tanks.shift())
        }
        teams.push(strikers.shift())
        teams.push(strikers.shift())
        teams.push(strikers.shift())
        if (type === 'Raid' || loop > 1) { // && loop == nTeams - 1
            teams.push(specials.shift())
        } else {
            teams.push(healers.shift())
        }
        teams.push(specials.shift())
        if (loop < nTeams - 1) {
            teams.push('')
        }
    }
    console.log('Teams', teams)
    return [students, teams]
}

async function main() {
    const rawData = await pullData()

    // Overall
    const students = await formation(rawData)
    console.log('Overall', students)
    const light = await formation(rawData, defEnemy='light')
    console.log('Overall Light', light)
    const heavy = await formation(rawData, defEnemy='heavy')
    console.log('Overall Heavy', heavy)
    const special = await formation(rawData, defEnemy='special')
    console.log('Overall Special', special)

    // PVP
    const pvp = await formation(rawData, 'PVP')
    console.log('PVP', pvp)

    // Raid
    const raidHeavy = await formation(rawData, defEnemy='light', environment='default', type='Raid')
    console.log('Raid Heavy', raidHeavy)
    const raidLight = await formation(rawData, defEnemy='heavy', environment='default', type='Raid')
    console.log('Raid Light', raidLight)
    const raidSpecial = await formation(rawData, defEnemy='special', environment='default', type='Raid')
    console.log('Raid Special', raidSpecial)

    new Vue({
        el: '#ba-tables',
        data: {
            tables: [
                { classes: 'ba-table overall', headers: columnsOverall, rows: students[0], tags: students[0].map(student => student['ATK Type']) },
                { classes: 'ba-table overall light', headers: columnsOverall, rows: light[0], tags: light[0].map(student => student['ATK Type']) },
                { classes: 'ba-table overall heavy', headers: columnsOverall, rows: heavy[0], tags: heavy[0].map(student => student['ATK Type']) },
                { classes: 'ba-table overall special', headers: columnsOverall, rows: special[0], tags: special[0].map(student => student['ATK Type']) },
                { classes: 'ba-table pvp', headers: columnsPvp, rows: pvp[0], tags: pvp[0].map(student => student['ATK Type']) },
                { classes: 'ba-table raid light', headers: columnsRaid, rows: raidLight[0], tags: raidLight[0].map(student => student['ATK Type']) },
                { classes: 'ba-table raid heavy', headers: columnsRaid, rows: raidHeavy[0], tags: raidHeavy[0].map(student => student['ATK Type']) },
                { classes: 'ba-table raid special', headers: columnsRaid, rows: raidSpecial[0], tags: raidSpecial[0].map(student => student['ATK Type']) }
            ]
        }
    })

    new Vue({
        el: '#ba-teams',
        data: {
            tables: [
                { classes: 'ba-team overall', headers: columnsOverall, rows: students[1], tags: students[1].map(student => student['ATK Type']) },
                { classes: 'ba-team overall light', headers: columnsOverall, rows: light[1], tags: light[1].map(student => student['ATK Type']) },
                { classes: 'ba-team overall heavy', headers: columnsOverall, rows: heavy[1], tags: heavy[1].map(student => student['ATK Type']) },
                { classes: 'ba-team overall special', headers: columnsOverall, rows: special[1], tags: special[1].map(student => student['ATK Type']) },
                { classes: 'ba-team pvp', headers: columnsPvp, rows: pvp[1], tags: pvp[1].map(student => student['ATK Type']) },
                { classes: 'ba-team raid light', headers: columnsRaid, rows: raidLight[1], tags: raidLight[1].map(student => student['ATK Type']) },
                { classes: 'ba-team raid heavy', headers: columnsRaid, rows: raidHeavy[1], tags: raidHeavy[1].map(student => student['ATK Type']) },
                { classes: 'ba-team raid special', headers: columnsRaid, rows: raidSpecial[1], tags: raidSpecial[1].map(student => student['ATK Type']) }
            ]
        }
    })
}

main()