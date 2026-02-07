export function mapIntent(analysis) {
    const { impact, signals, totalWeight } = analysis;
    
    // Check for documentation changes
    if (signals.doc_image_change || signals.doc_link_change || signals.doc_heading_change) {
        return {
            type: 'build_in_public',
            angle: 'documentation_progress',
        };
    }
    
    if (signals.doc_tech_stack_change) {
        return {
            type: 'build_in_public',
            angle: 'tech_stack_update',
        };
    }
    
    // High risk changes
    if (impact === 'HIGH_RISK') {
        return {
            type: 'technical_decision',
            angle: 'engineering_tradeoff',
        };
    }
    
    // Async patterns
    if (signals.async_change || signals.promise_change) {
        return {
            type: 'learning',
            angle: 'async_patterns',
        };
    }
    
    // Error handling
    if (signals.error_handling_change) {
        return {
            type: 'technical_decision',
            angle: 'error_handling',
        };
    }
    
    // Networking changes
    if (signals.networking_change) {
        return {
            type: 'technical_decision',
            angle: 'networking',
        };
    }
    
    // Large changes
    if (totalWeight > 500) {
        return {
            type: 'technical_decision',
            angle: 'large_change',
        };
    }
    
    // Default: small win
    return {
        type: 'daily_update',
        angle: 'small_win',
    };
}