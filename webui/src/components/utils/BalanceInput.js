import React from 'react'

export default ({
    name, value, onChange,
}) => {
    return (
        <tr>
            <td>{name}</td>
            <td>
                <input
                    style={{ width: '97.5%' }}
                    type='number'
                    value={value}
                    step="0.001"
                    onChange={event => {
                        onChange(event.target.value)
                    }} />
            </td>
        </tr>
    )
}