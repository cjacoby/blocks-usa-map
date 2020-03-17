import React from 'react';

function Summary ({ data }) {
    return (
        <div>
            <h3>Summary</h3>
            <h4>Democrat Total: {data["Democrat"]}</h4>
            <h4>Republican Total: {data["Republican"]}</h4>
            <h4>Unallocated: {data[""]} </h4>
        </div>
    );
}


export default Summary;
