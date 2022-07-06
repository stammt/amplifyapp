import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
import { withAuthenticator, Authenticator } from '@aws-amplify/ui-react';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

const myAPI = "apif93994c9"
const path = '/notes'; 

function App() {
  const [notes, setNotes] = useState([]);
  const [msg, setMsg] = useState("not yet")
  const [formData, setFormData] = useState(initialFormState);

    //Function to fetch from our backend and update customers array

  useEffect(() => {
    fetchNotes();
    getMsg();
  }, []);

  function getStrava() {
    fetch("https://www.strava.com/api/v3/athlete",
     {
      headers: {
        'Authorization': 'Bearer NOPE'
      }
     }).then(res => res.json())
     .then(
      (result) => {
        console.log(result)
        setMsg('strava result' + result.username)
        // this.setState({
        //   isLoaded: true,
        //   items: result.items
        // });
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        this.setMsg('strava error');
      }
    )
  }
  
  function getMsg() {
    let customerId = 1 // e.input
    console.log("getMsg")
    setMsg("getting")
    API.get(myAPI, path + "/1")
       .then(response => {
         console.log(response)
        //  let newCustomers = [...customers]
        //  newCustomers.push(response)
        //  setCustomers(newCustomers)
        setMsg(response)
       })
       .catch(error => {
         console.log(error)
         setMsg("error")
       })
  }


  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  return (
    <div className="App">
      <h1>My Notes App</h1>
      <h2>message {msg}</h2>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      <input
        type="file"
        onChange={onChange}
      />
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <button onClick={() => deleteNote(note)}>Delete note</button>
              {
                note.image && <img src={note.image} style={{width: 400}} />
              }
            </div>
          ))
        }
      </div>
         <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
          <p>
            Hey {user.username}, welcome to my channel, with auth!
          </p>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </Authenticator>
    </div>
  );
}

export default withAuthenticator(App);