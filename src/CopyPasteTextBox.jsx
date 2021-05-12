import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import ReactSnackBar from "react-js-snackbar";


class CopyPasteTextBox extends Component {
    constructor(props) {
        super(props);
        this.state = { copyPasteContent: "", allQuizQuestions: [], charsLimitReached: false, generatingQuestions: false, questionsSuccess: false, questionsFail: false }

    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }
    handleTextChange(e) {
        let nextValue = e.target.value;
        this.setState({ copyPasteContent: nextValue });
    }


    getTenRandomQuestions() {
        //generates random k questions from allQuizQuestions
        let k = 10;
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

        let huggingFaceApiKey = "Bearer api_ynAnWxlAXdpXPiaAwtSXTiKusXzWAWAAOY"; //COMMENT IT OUT BEFORE PUSHING! 

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
            console.log(error);
        }


    }
    showAlert(type) {
        //alert message with type as state
        this.setState({ [type]: true });
        setTimeout(() => {
            this.setState({ [type]: false });
        }, 5000);
    }

    async getNamedEntities(sentence) {
        console.log("HI", sentence);

        let huggingFaceApiKey = "Bearer api_ynAnWxlAXdpXPiaAwtSXTiKusXzWAWAAOY"; //COMMENT IT OUT BEFORE PUSHING! 
        //const ner_filters = ["NOUN", "PROPN", "ORG", "PERS"]; //TODO Filter out only certain named entities
        try {
            const url = "https://api-inference.huggingface.co/models/dslim/bert-base-NER";
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
                let named_entities = json;
                if (!named_entities) {
                    return;
                }
                let entity_filters = ["MISC"]; //not needed entities!
                let filtered_entities = [];
                for (var entity of named_entities) {
                    if (entity_filters.includes(entity["entity_group"]) || entity["word"].includes("#")) {
                        continue;
                    }
                    filtered_entities.push(entity);

                }

                let random_entity = filtered_entities[Math.floor(Math.random() * filtered_entities.length)]; //pick a random entity from the filtered entity
                let question = sentence.replaceAll(random_entity["word"], "____")
                console.log(question);
                let id = this.state.allQuizQuestions.length;
                let current_question = { "id": id, "type": "fill_in_the_blanks", "text": random_entity["word"], "question": question };
                this.setState({ allQuizQuestions: [...this.state.allQuizQuestions, current_question] });



            }


        } catch (error) {

            console.log(error);
        }

    }
    trimSentences(sentences, chars_allowed) {
        let c = 0;
        let trimmed_sentences = []; //limit to 1k chars
        for (var sentence of sentences) {
            c += sentence.length;
            trimmed_sentences.push(sentence);
            if (c > chars_allowed) {
                break;
            }

        }
        return trimmed_sentences;

    }
    async generateQuiz() {

        let CHAR_LIMIT = 10000;
        //flush out all the existing questions 
        this.setState({ "allQuizQuestions": [] });
        let content = this.state.copyPasteContent;
        if (content.length > CHAR_LIMIT) {
            //more than 10k chars
            this.showAlert("charsLimitReached");
            return;
        }
        this.showAlert("generatingQuestions");
        //console.log(content);
        let sentences = content.split(".");
        sentences = this.shuffleArray(sentences); //shuffle sentences! 
        let trimmed_sentences = this.trimSentences(sentences, 1000);
        for (var sentence of trimmed_sentences) {
            if (this.state.allQuizQuestions.length > 10) {
                //we have 10 questions!
                break;
            }
            await this.getQuestionFromT5(sentence); //Get Questions From T5
            //await this.getNamedEntities(sentence);
        }
        sentences = this.shuffleArray(sentences); //shuffle sentences again! 

        trimmed_sentences = this.trimSentences(sentences, 1000);
        for (var sentence of trimmed_sentences) {
            if (this.state.allQuizQuestions.length > 10) {
                //we have 10 questions!
                break;
            }
            await this.getNamedEntities(sentence); //Form Fill In the Blank Questions using Named Entities
        }
        //TODO Get top 10 questions (for now I am doing this randomly)
        let top10 = this.getTenRandomQuestions();
        if (top10.length > 0) {

            this.props.storeQuiz(top10); //save quiz to STORE
            this.showAlert("questionsSuccess"); //show success toast!
        }

    }
    clearClipBoard() {
        this.setState({ copyPasteContent: "" });
    }

    render() {

        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div >
                    <TextField
                        style={{ position: "absolute", top: "20%", left: "40%", width: "30%" }}
                        id="standard-multiline-static"
                        label="Copy-Paste Study Notes"
                        multiline
                        rows={15}
                        value={this.state.copyPasteContent}
                        onChange={(e) => { this.handleTextChange(e) }}
                    />
                </div>

                <div style={{ position: "absolute", top: "65%", left: "50%" }}>
                    <Button variant="contained" color="primary" onClick={() => this.generateQuiz()}>
                        GENERATE QUIZ
                </Button>
                </div>

                <ReactSnackBar Icon={<span>🙉</span>} Show={this.state.charsLimitReached}>
                    Too many chars! (greater than 1k chars)
                </ReactSnackBar>

                <ReactSnackBar Icon={<span>🦄</span>} Show={this.state.generatingQuestions}>
                    Generating questions...
                </ReactSnackBar>

                <ReactSnackBar Icon={<span>✅</span>} Show={this.state.questionsSuccess}>
                    Success! Check 'Questions' Tab
                </ReactSnackBar>
                <ReactSnackBar Icon={<span>⁉️</span>} Show={this.state.questionsFail}>
                    Oh no! Something went wrong.
                </ReactSnackBar>

            </div>
        );
    };
}

const mapDispatchToProps = (dispatch) => {
    // Action
    return {
        storeQuiz: (questions) => dispatch({ type: 'GENERATE_QUIZ', questions: questions }),
    };
};


// Exports
export default connect(null, mapDispatchToProps)(CopyPasteTextBox);