const initialState = {
    questions: [],
    uploadedFile: {},

};

export default function appReducer(state = initialState, action) {

    switch (action.type) {
        case 'GENERATE_QUIZ': {
            return {
                // that has all the existing state data
                ...state,
                questions: action.questions

            }
        }
        case 'UPDATE_FILE': {

            return {
                // that has all the existing state data
                ...state,
                uploadedFile: action.file

            }
        }

        default:
            // If this reducer doesn't recognize the action type, or doesn't
            // care about this specific action, return the existing state unchanged
            return state
    }
}