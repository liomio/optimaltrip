import React, { Component } from 'react';
import logo from './logo.svg';
//import './App.css';
import { Container, Header } from 'semantic-ui-react'
import MainForm from './MainForm.js'

class App extends Component {
    state ={users: []}
    componentDidMount() {
        fetch('/test')
            .then(res => console.log('BODY: ' + JSON.stringify(res.body, null, 2)))
    }
    render() {
        return (
            <Container className="App">
                <Container>
                    <Header>NT Flights </Header>
                </Container>
                <MainForm />
            </Container>
        );
    }
}

export default App;
