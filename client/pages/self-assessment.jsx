import React from 'react';
import AppContext from '../app-context';

const style = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  icons: {
    display: 'flex',
    width: '100%',
    height: '100px',
    justifyContent: 'center'
  }
};

export default class SelfAssessment extends React.Component {
  constructor(props) {
    super(props);
    this.flashcards = [];
    this.index = 0;
    this.question = true;
    this.userId = this.props.batch.userId;
    this.title = this.props.batch.batchName;
    this.batch = this.props.batch;
    this.good = 0;
    this.bad = 0;
    this.change = false;
    this.color = [];
    this.text = [];
    this.maxScores = 10;
    this.state =
    {
      title: this.title,
      content: '',
      text: '',
      color: null
    };

    this.checkSpace = this.checkSpace.bind(this);
    this.previousClick = this.previousClick.bind(this);
    this.nextClick = this.nextClick.bind(this);
    this.wrong = this.wrong.bind(this);
    this.flipCard = this.flipCard.bind(this);
    this.correct = this.correct.bind(this);
    this.postResult = this.postResult.bind(this);
  }

  componentDidMount() {
    fetch(`/api/cards/${this.batch.batchId}`)
      .then(res => res.json())
      .then(result => {
        this.flashcards = result;
        this.setState({ content: result[0].question });
      })
      .catch(error => console.error('Get index error!', error));
    for (let i = 0; i < this.flashcards.length; i++) {
      this.color.push(null);
      this.text.push('');
    }
    this.checkSpace();
  }

  checkSpace() {
    fetch(`/api/scores/${this.userId}`)
      .then(res => res.json())
      .then(result => {
        if (result.length >= this.maxScores) {
          const smallest = result[0].scoreId;
          const req = {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          };
          fetch(`/api/scores/${smallest}`, req)
            .then(res2 => res2.json())
            .then(result2 => { })
            .catch(error2 => console.error('Delete scores failed!', error2));
        }
      })
      .catch(error => console.error('Get scores failed!', error));
  }

  previousClick() {
    this.question = true;
    if (this.index > 0) {
      this.index--;
      this.setState(
        {
          content: this.flashcards[this.index].question,
          text: this.text[this.index],
          color: this.color[this.index]
        }
      );
    }
  }

  nextClick() {
    this.question = true;
    if (this.index < this.flashcards.length - 1) {
      this.index++;
      this.setState(
        {
          content: this.flashcards[this.index].question,
          text: this.text[this.index],
          color: this.color[this.index]
        }
      );
    }
  }

  wrong() {
    this.change = true;
    if (this.text[this.index] === 'Wrong!') return;
    if (this.text[this.index] === 'Correct!') {
      this.good--;
    }
    this.bad++;
    this.color[this.index] = { color: 'red' };
    this.text[this.index] = ('Wrong!');
    this.setState({
      text: this.text[this.index],
      color: this.color[this.index]
    });
  }

  flipCard() {
    this.question = !this.question;
    if (this.question) {
      this.setState({ content: this.flashcards[this.index].question });
    } else {
      this.setState({ content: this.flashcards[this.index].answer });
    }
  }

  correct() {
    this.change = true;
    if (this.text[this.index] === 'Correct!') return;
    if (this.text[this.index] === 'Wrong!') {
      this.bad--;
    }
    this.good++;
    this.color[this.index] = { color: 'green' };
    this.text[this.index] = 'Correct!';
    this.setState({
      text: this.text[this.index],
      color: this.color[this.index]
    });
  }

  postResult() {
    if (!this.change) return;
    this.checkSpace();
    const folderId = this.batch.folderId;
    if (typeof folderId === 'undefined') {
      const score = {
        userId: this.props.batch.receiveUserId,
        folderName: 'Shared',
        batchName: this.title,
        correct: this.good,
        total: this.flashcards.length
      };
      const req = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(score)
      };
      fetch('/api/scores', req)
        .then(res2 => res2.json())
        .then(result2 => {})
        .catch(error2 => console.error('postResult error', error2));
      return;
    }
    fetch(`/api/folders/${folderId}`)
      .then(res => res.json())
      .then(result => {
        const score = {
          userId: this.userId,
          folderName: result.folderName,
          batchName: this.title,
          correct: this.good,
          total: this.flashcards.length
        };
        const req = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(score)
        };
        fetch('/api/scores', req)
          .then(res2 => res2.json())
          .then(result2 => {})
          .catch(error2 => console.error('postResult error', error2));
      })
      .catch(error => console.error('Get folder error!', error));
  }

  render() {
    const sideText = this.question === true
      ? 'Question'
      : 'Answer';
    return (
      <div style={style.container}>
        <div style={style.icons}>
          <a href="#"><img className="home-icon"></img></a>
          <a href="#scores"><img className="scores2"></img></a>
          <div className="stats">
            <span className="title" style={{ color: 'green' }}>Correct: {this.good}</span>
            <span className="title" style={{ color: 'red' }}>Wrong: {this.bad}</span>
            <span className="title" style={{ color: 'gray' }}>Skipped: {this.flashcards.length - this.good - this.bad}</span>
          </div>
          <a href="#edit-cards"><img className="edit" onClick={() => this.props.setActiveBatch(this.batch)}></img></a>
          <img className="post" onClick={this.postResult}></img>
        </div>
        <h2 className="w-100 create-title">{this.title}</h2>
        <h2 className="track-cards">{this.index + 1}/{this.flashcards.length}</h2>
        <h2 style={this.state.color}>{this.state.text}</h2>
        <div className="space">
          <img className="previous" onClick={this.previousClick} />
          <div className="area">{this.state.content}</div>
          <img className="next" onClick={this.nextClick} />
        </div>
        <h2 className="track-cards">{sideText}</h2>
        <div className="bottom-space">
          <img className="wrong" onClick={this.wrong}></img>
          <img className="question-answer" onClick={this.flipCard}></img>
          <img className="correct" onClick={this.correct}></img>
        </div>
      </div>
    );
  }
}
SelfAssessment.contextType = AppContext;
