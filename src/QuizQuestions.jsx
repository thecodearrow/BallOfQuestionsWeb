import React, { Component } from 'react'
import { connect } from 'react-redux';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

class QuizQuestions extends Component {
    render() {
        let questions = this.props.questions; //from the store!
        let id = 0;
        let questionElements = questions.map((q) => {
            id += 1;
            let qString = id + ")" + " " + q.question;
            return (<ListItem key={id} button><ListItemText primary={qString} secondary={q.text} /></ListItem>);

        }

        );
        console.log(this.props.questions, "Printing from Quiz UI");
        return (<List style={{ position: "absolute", top: "10%", left: "20%" }} component="nav">
            {questionElements}
        </List>

        )
    }
}


const mapStateToProps = (state) => ({ questions: state.questions })
// Exports
export default connect(mapStateToProps, null)(QuizQuestions);