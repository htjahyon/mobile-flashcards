import React from 'react';

const style = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  icons: {
    width: '100%',
    height: '100px'
  }
};

export default class Scores extends React.Component {
  constructor(props) {
    super(props);
    this.testResults = [];
    this.displayResults = this.displayResults.bind(this);
  }

  displayResults() {

  }

  render() {
    return (
      <div style={style.container}>
        <h1 className="track-cards">No Grades Posted Yet!</h1>
        <img className="track-cards scores-results"></img>
        <a href="#" className="track-cards">Go Home</a>
      </div>
    );
  }
}
