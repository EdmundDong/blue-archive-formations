Vue.component('ba-table', {
    props: ['classes', 'headers', 'rows', 'tags'],
    template: `
        <div :class='classes'>
            <h3>{{ classes.split('-').slice(1).join(' ').toUpperCase() + ' TABLE' }}</h3>
            <table class='table'>
                <thead>
                    <tr>
                        <th scope='col' v-for='header in headers'>{{ header }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr scope='row' v-for='(row, index) in rows' :class='tags[index]'>
                        <td scope='col' v-for='header in headers'>
                            {{ row[header] }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
})