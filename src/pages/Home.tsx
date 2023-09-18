
import axios from 'axios'
import { BASE_URL } from '../config/constants';
import { useDispatch } from 'react-redux'
import { Route, Routes }  from 'react-router-dom'

//import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {
    Pool,
    SwapWidget,
    Addliquidity,
    //RemoveLiquidity
} from '../components';
import { useEffect } from 'react';
export function Home() {
    const dispatch = useDispatch();

    const getTokens = async () => {
        axios.get(BASE_URL+'tokens').then((res)=>{
            const val = res.data.data.map((elem:Record<string,any>)=> {
                return {
                    'label':elem.symbol,
                    'value':elem.symbol,
                    'image':'/src/assets/images/coins/'+elem.symbol+'.png',
                    'contract':elem.contract,
                    'oracle':elem.oracle,
                }
            })
            dispatch({type:'tokens',payload:val});
        })
    }
    useEffect(()=>{
        getTokens()
    },[])
    return (
        <Routes>
            <Route path="/pool" element={<Pool/>} />
            <Route path="/swap" element={<SwapWidget/>} />
            <Route path="/addLiquidity" element={<Addliquidity/>} />
s

        </Routes>
    );
}
/*

                <Route path="/removeLiquidity" element={<RemoveLiquidity/>} />
*/
