import React, { Component } from 'react'
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';

class UploadTextFile extends Component {
    constructor(props) {
        super(props);
        this.state = { allQuizQuestions: [] }

    }
    handleFileUpload = (e) => {
        e.preventDefault();
        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = (e.target.result);
            this.generateQuiz(text);
        };
        reader.readAsText(e.target.files[0]);
    }
    getTenRandomQuestions() {
        //generates random k questions from allQuizQuestions
        let k = 15;
        let currentQuizQuestions = [];
        let questions = this.state.allQuizQuestions;
        console.log("Current Quiz", questions.length);
        questions.sort(() => Math.random() - Math.random()); //randomize the questions
        let questions_seen = new Set();
        let i = 0; //variable to loop through the questions list
        let number_of_questions = 0; //questions counter variable (we need k questions)
        while (number_of_questions < k && i < questions.length) {
            if (!questions_seen.has(questions[i].text)) {
                //if we haven't already added this question to the current quiz
                questions_seen.add(questions[i].text);
                number_of_questions += 1;
                currentQuizQuestions.push(questions[i]);
                //console.log(questions[i]);
            }
            i += 1;
        }

        // console.log(currentQuizQuestions);
        return currentQuizQuestions;

    }
    async getQuestionFromT5(sentence) {
        // MCQs, Fill in the Blanks and General Questions 
        //find out the NER and frame questions and add it to allQuizQuestions 
        //HuggingFace iarfmoose/t5-base-question-generator Model
        //Add Key to Expo Config

        let huggingFaceApiKey = "Bearer api_CFeIvObMXROvMWGwGWVecWnAtQCTlObUVC"; //COMMENT IT OUT BEFORE PUSHING! 

        try {
            const url = "https://api-inference.huggingface.co/models/iarfmoose/t5-base-question-generator";
            const config = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': huggingFaceApiKey
                },
                body: JSON.stringify({ "inputs": sentence })
            }
            const response = await fetch(url, config);
            const json = await response.json();
            if (response.ok) {
                let question = json[0]["generated_text"];
                if (question.includes("?")) {
                    //to filter out better questions and  which has ? in the generated output
                    question = question.split('?')[0] + "?";
                    console.log(question);
                    let id = this.state.allQuizQuestions.length;
                    let current_question = { "id": id, "type": "general", "text": sentence, "question": question };
                    this.setState({ allQuizQuestions: [...this.state.allQuizQuestions, current_question] });
                }

            }


        } catch (error) {
            //
            //Toast.show(error);
            console.log(error);
        }
        const ner_filters = ["NOUN", "PROPN", "ORG", "PERS"]; //TODO Filter out only certain named entities
        /*
        if (doc.ents.length > 0) {
            let r = Math.floor(Math.random() * doc.ents.length); //random entity is picked!
            let current_question = this.getQuestion(sentence, doc.ents[r].text); //get a question for a random entity!
            //console.log("Executing", current_question);
            this.setState({ allQuizQuestions: [...this.state.allQuizQuestions, current_question] });
            //console.log("printing state", this.state)
        }

        */

    }

    async generateQuiz(text) {

        //Show Toast
        //flush out all the existing questions 
        this.setState({ "allQuizQuestions": [] });
        let content = text;
        if (content.length > 10000) {
            //more than 10k chars
            alert("Pasted text is too huge to be processed!");
            return;
        }
        //console.log(content);
        let sentences = content.split(".");
        for (var sentence of sentences) {
            let temp = await this.getQuestionFromT5(sentence); //IMP! This has to finish executing before executing the next few lines!
        }
        //TODO Get top 10 questions (for now I am doing this randomly)
        let top10 = this.getTenRandomQuestions();
        if (top10.length > 0) {

            this.props.storeQuiz(top10); //save quiz to STORE
            alert("Quiz Generated! Check 'Questions' Tab");
        }

    }
    render() {
        return (
            <div style={{ position: "absolute", top: "35%", left: "45%" }}>
                <input label="Upload" type="file" accept=".txt" onChange={(e) => this.handleFileUpload(e)} />


            </div>

        )
    }
}

const mapDispatchToProps = (dispatch) => {
    // Action
    return {
        storeQuiz: (questions) => dispatch({ type: 'GENERATE_QUIZ', questions: questions }),
    };
};


// Exports
export default connect(null, mapDispatchToProps)(UploadTextFile);
