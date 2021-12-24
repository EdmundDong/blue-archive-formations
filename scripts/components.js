Vue.component('ba-table', {
    props: ['headers', 'students'],
    template: `
        <table class="table">
            <thead>
                <tr>
                    <th scope="col" v-for="header in headers"> {{ header }}</th>
                </tr>
            </thead>
            <tbody>
                <tr scope="row" v-for="(student, index) in students" :class="[atkType[index]]">
                    <td scope="col" v-for="header in headers">
                        {{ student[header] }}
                    </td>
                </tr>
            </tbody>
        </table>
    `
})


