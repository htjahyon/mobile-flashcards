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
    this.choices = null;
    this.state =
    {
      title: this.title,
      content: '',
      text: '',
      color: null,
      choices: [],
      answer: ''
    };

    this.checkSpace = this.checkSpace.bind(this);
    this.previousClick = this.previousClick.bind(this);
    this.nextClick = this.nextClick.bind(this);
    this.wrong = this.wrong.bind(this);
    this.flipCard = this.flipCard.bind(this);
    this.correct = this.correct.bind(this);
    this.postResult = this.postResult.bind(this);
    this.multipleChoice = this.multipleChoice.bind(this);
    this.freeResponse = this.freeResponse.bind(this);
    this.match = this.match.bind(this);
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
          color: this.color[this.index],
          answer: this.flashcards[this.index].answer
        }
      );
      const temp = [];
      let count = 0;
      for (let i = this.index; i < 4; i++) {
        if (count >= 4) break;
        if (typeof this.flashcards[this.index + i] === 'undefined') i = 0;
        temp.push(this.flashcards[this.index + i]);
        count++;
      }
      this.setState({ choices: temp });
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
          color: this.color[this.index],
          answer: this.flashcards[this.index].answer
        }
      );
      const temp = [];
      temp.push(this.flashcards[this.index]);
      let count = 0;
      for (let i = this.index; i < 4; i++) {
        if (count >= 4) break;
        if (typeof this.flashcards[this.index + i] === 'undefined') i = 0;
        temp.push(this.flashcards[this.index + i]);
        count++;
      }
      this.setState({ choices: temp });
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
    const modal = document.querySelector('.modal');
    modal.style = 'display: flex';
    window.onclick = function (event) {
      if (event.target.className === 'ok') {
        modal.style = 'display: none';
      }
    };
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

  multipleChoice() {
    if (this.flashcards.length < 4) return;
    const spaceElement = document.querySelector('.space');
    const mcElement = document.querySelector('.multiple-choice');
    const freeElement = document.querySelector('.free-response');
    const radioElement = document.querySelector('.radio');
    const wrongElement = document.querySelector('.wrong');
    const correctElement = document.querySelector('.correct');
    spaceElement.style = 'width: 50%';
    mcElement.style = 'display: none';
    freeElement.style = 'display: block';
    radioElement.style = 'display: flex';
    wrongElement.style = 'display: none';
    correctElement.style = 'display: none';
    this.setState({ answer: this.flashcards[this.index].answer });
    const temp = [];
    temp.push(this.flashcards[this.index]);
    for (let i = this.index; i < 3; i++) {
      if (i >= 3) i = 0;
      temp.push(this.flashcards[i]);
    }
    this.setState({ choices: temp });
  }

  freeResponse() {
    const spaceElement = document.querySelector('.space');
    const freeElement = document.querySelector('.free-response');
    const mcElement = document.querySelector('.multiple-choice');
    const radioElement = document.querySelector('.radio');
    const wrongElement = document.querySelector('.wrong');
    const correctElement = document.querySelector('.correct');
    spaceElement.style = 'width: 100%';
    mcElement.style = 'display: block';
    freeElement.style = 'display: none';
    radioElement.style = 'display: none';
    wrongElement.style = 'display: block';
    correctElement.style = 'display: block';
  }

  match(choiceAnswer) {
    if (this.state.answer === choiceAnswer) {
      this.correct();
    } else this.wrong();
  }

  render() {
    const sideText = this.question === true
      ? 'Question'
      : 'Answer';
    this.choices = this.state.choices.map(choice => (
      <label className="radio-dot" key={choice.id} >
        <input type="radio" name="genre" value={choice.answer} onClick={() => this.match(choice.answer)}/>{choice.answer}
      </label>
    ));
    return (
      <div style={style.container}>
        <div style={style.icons}>
          <a href="#"><div className="home-icon"></div></a>
          <a href="#scores"><div className="scores2"></div></a>
          <div className="stats">
            <span className="title" style={{ color: 'green' }}>Correct: {this.good}</span>
            <span className="title" style={{ color: 'red' }}>Wrong: {this.bad}</span>
            <span className="title" style={{ color: 'gray' }}>Skipped: {this.flashcards.length - this.good - this.bad}</span>
          </div>
          <a href="#edit-cards"><div className="edit" onClick={() => this.props.setActiveBatch(this.batch)}></div></a>
          <div className="post" onClick={this.postResult}></div>
          <div className="multiple-choice" onClick={this.multipleChoice}></div>
          <div className="free-response" onClick={this.freeResponse}></div>
        </div>
        <h2 className="w-100 create-title">{this.title}</h2>
        <h2 className="track-cards">{this.index + 1}/{this.flashcards.length}</h2>
        <h2 style={this.state.color}>{this.state.text}</h2>
        <div className="middle">
          <div className="space">
            <div className="previous" onClick={this.previousClick} />
            <div className="area">{this.state.content}</div>
            <div className="next" onClick={this.nextClick} />
          </div>
          <div className="radio">
            {this.choices}
          </div>
        </div>
        <h2 className="track-cards">{sideText}</h2>
        <div className="bottom-space">
          <div className="wrong" onClick={this.wrong}></div>
          <div className="question-answer" onClick={this.flipCard}></div>
          <div className="correct" onClick={this.correct}></div>
        </div>
        <div className="modal">
          <p className="modalText">Score Posted!</p>
          <button className="ok">OK</button>
        </div>;
      </div>
    );
  }
}
SelfAssessment.contextType = AppContext;
