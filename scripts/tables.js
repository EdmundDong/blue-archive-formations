var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keyLfkfBG43VXN52y' }).base('app24peMma4LiqxIh');

Vue.config.devtools = true
columns = ['Student', 'Overall Tier', 'PVP Tier', 'Raid Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
columnsOverall = ['Student', 'Overall Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
columnsPvp = ['Student', 'PVP Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']
columnsRaid = ['Student', 'Raid Tier', 'ATK Type', 'DEF Type', 'Role', 'Class', 'ATK']

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

function formHeavy(data) {
    var students = JSON.parse(JSON.stringify(data));
    for (let student in students) {
        console.log('Checking', students[student])
        if (students[student]['ATK Type'] == 'Piercing') {
            students[student]['ATK'] /= 2
            students[student]['Overall Tier'] += 1
        } else if (students[student]['ATK Type'] == 'Explosive') {
            students[student]['ATK'] *= 2
            students[student]['Overall Tier'] -= 1
        }
    }
    students.sort((a, b) => a["Overall Tier"] - b["Overall Tier"] || b["ATK"] - a["ATK"])
    return students
}

function formLight(data) {
    var students = JSON.parse(JSON.stringify(data));
    for (let student in students) {
        console.log('Checking', students[student])
        if (students[student]['ATK Type'] == 'Mystic') {
            students[student]['ATK'] /= 2
            students[student]['Overall Tier'] += 1
        } else if (students[student]['ATK Type'] == 'Piercing') {
            students[student]['ATK'] *= 2
            students[student]['Overall Tier'] -= 1
        }
    }
    students.sort((a, b) => a["Overall Tier"] - b["Overall Tier"] || b["ATK"] - a["ATK"])
    return students
}

function formSpecial(data) {
    var students = JSON.parse(JSON.stringify(data));
    for (let student in students) {
        console.log('Checking', students[student])
        if (students[student]['ATK Type'] == 'Explosive') {
            students[student]['ATK'] /= 2
            students[student]['Overall Tier'] += 1
        } else if (students[student]['ATK Type'] == 'Mystic') {
            students[student]['ATK'] *= 2
            students[student]['Overall Tier'] -= 1
        }
    }
    students.sort((a, b) => a["Overall Tier"] - b["Overall Tier"] || b["ATK"] - a["ATK"])
    return students
}

function formPvp(data) {
    var students = JSON.parse(JSON.stringify(data));
    students.sort((a, b) => a["PVP Tier"] - b["PVP Tier"] || b["ATK"] - a["ATK"])
    return students
}

Vue.component('button-counter', {
    data: function () {
        return {
            count: 0
        }
    },
    template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
})

async function main() {
    students = await pullData()
    students.sort((a, b) => a["Overall Tier"] - b["Overall Tier"] || b["ATK"] - a["ATK"])
    console.log('Students', students)
    heavy = await formHeavy(students)
    console.log('Heavy', heavy)
    light = await formLight(students)
    console.log('Light', heavy)
    special = await formSpecial(students)
    console.log('Special', heavy)
    pvp = await formPvp(students)
    console.log('PVP', pvp)
    atkTypeOverall = students.map(student => student['ATK Type'])
    console.log('atkTypeOverall', atkTypeOverall)

    new Vue({
        el: '#tableAll',
        data: {
            headers: columnsOverall,
            students: students,
            atkType: students.map(student => student['ATK Type'])
        }
    })
    new Vue({
        el: '#tableHeavy',
        data: {
            headers: columnsOverall,
            students: heavy,
            atkType: heavy.map(student => student['ATK Type'])
        }
    })
    new Vue({
        el: '#tableLight',
        data: {
            headers: columnsOverall,
            students: light,
            atkType: light.map(student => student['ATK Type'])
        }
    })
    new Vue({
        el: '#tableSpecial',
        data: {
            headers: columnsOverall,
            students: special,
            atkType: special.map(student => student['ATK Type'])
        }
    })
    new Vue({
        el: '#tablePVP',
        data: {
            headers: columnsPvp,
            students: pvp,
            atkType: pvp.map(student => student['ATK Type'])
        }
    })
    Vue.component('ba-table', {
        props: ['headers', 'students'],
        template: '{{ headers }} {{ students }}'
        // template: `
        //     <div class="ba-table">
        //         <table class="table">
        //             <thead>
        //                 <tr>
        //                     <th scope="col" v-for="header in headers"> {{ header }}</th>
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 <tr scope="row" v-for="(student, index) in students" :class="[atkType[index]]">
        //                     <td scope="col" v-for="header in headers">
        //                         {{ student[header] }}
        //                     </td>
        //                 </tr>
        //             </tbody>
        //         </table>
        //     </div>
        // `
    })
    new Vue({
        el: '#data',
        data: {
            tables: [
                
            ]
        }
    })
    Vue.component('button-counter', {
        data: function () {
            return {
                count: 0
            }
        },
        template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
    })
    new Vue({ el: '#components-demo' })
    Vue.component('blog-post', {
        props: ['headers', 'students'],
        template: '<h3>{{ headers }}{{ students }}</h3>'
    })
    new Vue({
        el: '#blog-post-demo',
        data: {
            posts: [
                { headers: columnsOverall, students: students, }
            ]
        }
    })
}

main()