import React from 'react';
import AppContext from '../app-context';

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
    this.testResults = null;
    this.userId = this.props.userId;
    this.state = {
      testResults: []
    };
  }

  componentDidMount() {
    fetch(`/api/scores/${this.userId}`)
      .then(res => res.json())
      .then(result => {
        this.setState({ testResults: result });
      })
      .catch(error => console.error('Get scores error!', error));
  }

  render() {
    this.testResults = this.state.testResults.map(score => {
      const percent = Math.round(score.correct / score.total * 100);
      return (
          <tr key={score.scoreId}>
            <td className="data">{score.folderName}</td>
            <td className="data">{score.batchName}</td>
            <td className="data">{score.correct}/{score.total}</td>
            <td className="data">{percent}%</td>
          </tr>
      );
    });
    if (this.testResults.length === 0) {
      return (
      <div style={style.container}>
        <h1 className="track-cards">No Grades Posted Yet!</h1>
        <img className="track-cards scores-results"></img>
        <a href="#" className="track-cards">Go Home</a>
      </div>
      );
    }
    return (
      <div style={style.container}>
        <div style={style.icons}>
          <a href="#"><img className="home-icon"></img></a>
          <img className="track-cards scores-results"></img>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="column">Folders</th>
              <th scope="column">Batches</th>
              <th scope="column">Correct/Total</th>
              <th scope="column">Percentages</th>
            </tr>
          </thead>
            <tbody>
              {this.testResults}
            </tbody>
            <tfoot></tfoot>
          </table>
        </div>
    );
  }
}
Scores.contextType = AppContext;
