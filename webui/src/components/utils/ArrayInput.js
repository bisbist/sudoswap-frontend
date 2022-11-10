import React from 'react'

export default ({
    name, values, onValuesChange, 
    checkboxSelected, checkboxTitle, onCheckboxClick,
}) => {
    return (
        <tr>
            <td style={{ display: 'flex', flexDirection: 'row' }}>
                <span>{name}</span>
                <span style={{ flex: 1 }} />
                <input title={checkboxTitle}
                    type='checkbox'
                    checked={checkboxSelected}
                    onChange={() => {
                        onCheckboxClick()
                    }} />
            </td>
            <td>
                <input
                    value={values.join(",")}
                    onChange={event => {
                        onValuesChange(event.target.value.split(","))
                    }} />
            </td>
        </tr>
    )
}