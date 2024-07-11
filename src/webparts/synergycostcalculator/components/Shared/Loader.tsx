import * as React from 'react';
import { Component } from 'react';
import Beatloader from 'react-spinners/BeatLoader';
// import FadeLoader from 'react-spinners/FadeLoader';

class Loading extends Component {
    public render() {
        return (
            <div className="cc-loading">
                <div className='loader'>
                    <Beatloader size={15} margin={2} color={"rgb(51 220 186)"}></Beatloader>
                    {/* <FadeLoader height={15} width={5} radius={2} margin={2} color={"rgb(51 220 186)"}></FadeLoader> */}
                </div>
            </div>
        );
    }
}

export default Loading;