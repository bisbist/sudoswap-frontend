import React from "react"
import PairSwapAny from "./PairSwapAny"
import PairSwapSpecific from "./PairSwapSpecific"
import RobustPairSwapAny from "./RobustPairSwapAny"
import RobustPairSwapSpecific from "./RobustPairSwapSpecific"



const SwapList = ({
    type: inputType,
    swapList,
    onChange,
}) => {

    const onChangeHandler = (index) => {
        return (value) => {
            const newSwapList = [...swapList]
            newSwapList[index] = value
            onChange(newSwapList)
        }
    }

    const onCloseHandler = (index) => {
        return () => {
            const newSwapList = swapList.filter((_, i) => i != index)
            onChange(newSwapList)
        }
    }

    return (
        <div style={{
            margin: 5, minWidth: 500,
            border: 'solid', borderWidth: 1, borderColor: "red",
            height: 100,
            maxHeight: 100,
            display: "flex",
            flexDirection: "column"
        }}>
            <div style={{ display: "flex", margin: 5 }}>
                <span>Pairs</span>

                <span style={{ flex: 1 }} />

                <button onClick={() => {
                    switch (inputType) {
                        case "PairSwapAny":
                            return onChange([...swapList, { pair: "", numItems: 0 }])
                        case "PairSwapSpecific":
                            return onChange([...swapList, { pair: "", nftIds: [] }])
                        case "RobustPairSwapAny":
                            //console.log("hello bishal")
                            return onChange([...swapList, { swapInfo: { pair: "", numItems: 0 }, maxCost: 0 }])
                        case "RobustPairSwapSpecific":
                            return onChange([...swapList, { swapInfo: { pair: "", nftIds: [] }, maxCost: 0 }])
                    }
                }}>Add</button>
            </div>

            <div style={{ overflow: "auto", flex: 1, scrollbarWidth: "none", margin: 5 }}>
                {
                    swapList.map((arg, index) => {
                        return (
                            <div key={index} style={{ display: "flex", padding: 5, border: "solid", borderWidth: 1, borderColor: "green" }}>
                                {
                                    inputType == "PairSwapAny" ? (
                                        <PairSwapAny value={arg} onChange={onChangeHandler(index)} />
                                    ) :
                                        inputType == "PairSwapSpecific" ? (
                                            <PairSwapSpecific value={arg} onChange={onChangeHandler(index)} />
                                        ) :
                                            inputType == "RobustPairSwapAny" ? (
                                                <RobustPairSwapAny value={arg} onChange={onChangeHandler(index)} />

                                            ) :
                                                inputType == "RobustPairSwapSpecific" ? (
                                                    <RobustPairSwapSpecific value={arg} onChange={onChangeHandler(index)} />
                                                )
                                                    : null
                                }
                                <button onClick={onCloseHandler(index)}>x</button>
                            </div>
                        )
                    })
                }
            </div>
        </div >
    )
}

export default SwapList