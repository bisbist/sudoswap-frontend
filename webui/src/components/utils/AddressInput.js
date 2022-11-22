import React from 'react'
import { ethers } from 'ethers'

export default ({
    name, address, onChange,
}) => {
    const [valid, setValid] = React.useState(
        ethers.utils.isAddress(address));
    return (
        <tr>
            <td>{name}</td>
            <td>
                <input
                    type="text"
                    style={{
                        width: '97.5%',
                        fontFamily: "monospace"
                    }}
                    value={address}
                    onChange={event => {
                        const value = event.target.value
                        setValid(ethers.utils.isAddress(value))
                        onChange(value)
                    }} />
                {address && !valid && <div style={{ color: "red", fontSize: 12 }}>Please enter a valid address</div>}
            </td>
        </tr>
    )
}