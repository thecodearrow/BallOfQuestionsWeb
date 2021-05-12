import React, { Component } from 'react'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CopyPasteTextBox from './CopyPasteTextBox';
import QuizQuestions from "./QuizQuestions";
import UploadTextFile from "./UploadTextFile"

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === 0 && (
                <CopyPasteTextBox />
            )}
            {value === 1 && (
                <UploadTextFile />
            )}
            {value === 2 && (
                <QuizQuestions />
            )}
        </div>
    );
}

export default function ThreeTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <React.Fragment>
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                <Tab label="COPY-PASTE" />
                <Tab label="UPLOAD .TXT FILE" />
                <Tab label="QUESTIONS" />
            </Tabs>

            <TabPanel value={value} index={0} />
            <TabPanel value={value} index={1} />
            <TabPanel value={value} index={2} />


        </React.Fragment>

    )
}

