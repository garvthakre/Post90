export function mapIntent(analysis){
    const {impact,signals,totalWeight} = analysis;
    if(impact === 'HIGH_RISK'){
     return {
        type:'technical_decision',
        angle:'engineering_tradeoff',
     } ;  


    }
    if(signals.async_change || signals.promise_change){
        return {
            type:'technical_decision',
            angle:'asynchronous_handling',
        };
    }
    if(signals.error_handling_change){
        return {
            type:'technical_decision',
            angle:'error_handling',
        };
    }
    if(signals.networking_change){
        return {
            type:'technical_decision',
            angle:'networking',
        };
    }
    if(totalWeight > 500){
        return {
            type:'technical_decision',
            angle:'large_change',
        };
    }
    return {
        type:'daily_update',
        angle:'small_win',
    };
}