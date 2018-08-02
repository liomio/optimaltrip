import React, { Component } from 'react';
//import logo from './logo.svg';
//import './App.css';
import { Container, Header } from 'semantic-ui-react'
import MainForm from './MainForm.js'
import Map from './map/FlightMap.js'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
        this.getData = this.getData.bind(this)
    }
    componentDidMount() {
      //fetch('/api', {method:"POST"}).then(res => res.text()).then(json => this.setState({path:json}))
    }
    getData(val) {
      this.setState({val});
    }
    render() {
        return (
            <Container className="App">
                <Container>
                  <Header>Plan your trip</Header>
                </Container>
                <MainForm sendData={this.getData}/>
                { JSON.stringify(this.state) }
                <Map />
            </Container>
        );
    }
}

export default App;
