import { mapIntent } from './intentMapper.js';
import { TEMPLATES } from './templates.js';

export function composePost(analysis) {
    const intent = mapIntent(analysis);
    const template = TEMPLATES[intent.type]?.[intent.angle];
    if(!template){
        return `Made progress today. Every change, big or small, is a step forward.
         Celebrating the wins and learning from the challenges. #devlife`;
    }
    return template.trim();
}