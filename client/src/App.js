import React, { Component } from 'react';
//import logo from './logo.svg';
//import './App.css';
import { Container, Header } from 'semantic-ui-react'
import MainForm from './MainForm.js'
import Map from './map/Map.js'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
      //fetch('/api', {method:"POST"}).then(res => res.text()).then(json => this.setState({json}))
    }
    render() {
        return (
            <Container className="App">
                <Container>
                    <Header>Plan your trip</Header>
                    { this.state.json }
                </Container>
                <MainForm />
                <Map />
            </Container>
        );
    }
}

export default App;
