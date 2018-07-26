import React, { Component } from 'react';
import { Dropdown, Form, Container } from 'semantic-ui-react'
import codes from './codes.json'
import dropdownOptions from './dropdownOptions.json'

class MainForm extends Component {
    componentDidMount() {
        console.log(codes);
    }
    render() {
        return (
            <Container className="Form">
                <Form>
                    <Dropdown options={dropdownOptions} search />
                </Form>
            </Container>
        );
    }
}

export default MainForm;
