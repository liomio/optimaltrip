import React, { Component } from 'react';
import logo from './logo.svg';
//import './App.css';
import { Container, Header } from 'semantic-ui-react'
import MainForm from './MainForm.js'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
        fetch('/test').then(res => res.text()).then(json => this.setState({json}))
    }
    render() {
        return (
            <Container className="App">
                <Container>
                    <Header>NT Flights </Header>
                    { this.state.json }
                </Container>
                <MainForm />
            </Container>
        );
    }
}

export default App;
