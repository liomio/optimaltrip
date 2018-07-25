import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
    state ={users: []}
    componentDidMount() {
        fetch('/test')
            .then(res => console.log('BODY: ' + JSON.stringify(res.body, null, 2)))
    }
    render() {
        return (
            <div className="App">
                <h1>Users</h1>
                <p>{this.state.test}</p>
            </div>
        );
    }
}

export default App;
