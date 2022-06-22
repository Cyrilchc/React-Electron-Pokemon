import React, { useState, useEffect } from 'react';

import { Card, CardContent, Button, Grid, Typography, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } 
from '@mui/material'

import './styles/App.css';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [nextPage, setNextPage] = useState("");
  const [previousPage, setPreviousPage] = useState("");
  const [currentPageUrl, setCurrentPageUrl] = useState("https://pokeapi.co/api/v2/pokemon");
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [editPokemon, setEditPokemon] = useState(null)
  const [editPokemonChanges, setEditPokemonChanges] = useState(0)
  const [Loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([])
  const [openEditDialog, setOpenEditDialog] = useState(false)

  /**
   * Premier lancement, chargement des pokémons et du localstorage
   */
  useEffect(() => {
    getPokemons()
    loadStorage()
  }, []);

  /**
   * À chaque changement d'URL, charger les pokémons
   */
  useEffect(() => {
    getPokemons()
  }, [currentPageUrl]);

  /**
   * Workaround pour afficher la dialogue de modification
   */
  useEffect(() => {
    if (editPokemon !== null)
      setOpenEditDialog(true)
  }, [editPokemonChanges]);

  /**
   * Renvoie une chaine avec la première lettre en majuscule
   */
  function capitalizeFirstLetter(string) {
    if (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }

  /**
   * Obtient les pokémons
   */
  const getPokemons = () => {
    setLoading(true)
    fetch(currentPageUrl)
      .then(response => response.json())
      .then(data => {
        setPokemons(data.results)
        setNextPage(data.next)
        setPreviousPage(data.previous)
      }).finally(() => {
        setLoading(false)
      })
  }

  /**
   * Obtient l'image du pokémon avec son identifiant
   */
  const getPokemonImage = (url) => {
    const id = getPokemonId(url)
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
  }

  /**
   * Obtient les détails d'un pokémon
   */
  const getPokemonDetails = (url) => {
    setLoading(true)
    const id = getPokemonId(url)
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${id}`
    fetch(pokemonUrl)
      .then(response => response.json())
      .then(data => {
        setPokemonDetails(data)
      }).finally(() => {
        setLoading(false)
      });
  }

  /**
   * Obtient l'identifiant du pokémon
   */
  const getPokemonId = (url) => {
    const pokemonUrlSplit = url.split('/')
    const pokemonId = pokemonUrlSplit[pokemonUrlSplit.length - 2]
    return pokemonId
  }

  /**
   * Affiche la prochaine page fournie par l'API
   */
  const goToNextPage = () => {
    if (nextPage)
      setCurrentPageUrl(nextPage)
  }

  /**
   * Affiche la page précédente fournie par l'API
   */
  const goToPreviousPage = () => {
    if (nextPage)
      setCurrentPageUrl(previousPage)
  }

  /**
   * Ajoute le pokémon aux favoris
   */
  const addToFavorites = (pokemon) => {
    favorites.push(pokemon)
    saveStorage()
    loadStorage()
  }

  /**
   * Retire le pokémon des favoris
   */
  const removeFromFavorites = (pokemon) => {
    var pokemonIndex = favorites.indexOf(pokemon);
    if (pokemonIndex !== -1) {
      favorites.splice(pokemonIndex, 1);
    }

    saveStorage()
    loadStorage()
  }

  /**
   * Charge les pokémons favoris
   */
  const loadStorage = () => {
    const favs = JSON.parse(localStorage.getItem('favorites')) || []
    setFavorites(favs)
  }

  /**
   * Enregistre le localstorage
   */
  const saveStorage = () => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }

  /**
   * Affiche la dialogue de modification
   */
  const showEditDialog = (pokemon) => {
    setEditPokemon(pokemon)
    setEditPokemonChanges(editPokemonChanges + 1)
  }

  /**
   * Modifie le pokémon dans le localstorage et ferme la dialogue
   */
  const closeEditDialog = (pokemon) => {
    if (pokemon) {
      if (pokemon !== editPokemon) {
        removeFromFavorites(editPokemon)
        addToFavorites(pokemon)
      }
    }

    setOpenEditDialog(false)
  }

  return (
    <>
      <EditPokemonDialog
        pokemon={editPokemon}
        open={openEditDialog}
        onClose={closeEditDialog}
      />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {
            Loading ? <LinearProgress /> : null
          }
        </Grid>
        <Grid item xs={12} style={{ display: 'inline-flex', gap: '10px' }}>
          <Button onClick={goToPreviousPage} variant="outlined">Précédent</Button>
          <Button onClick={goToNextPage} variant="outlined">Suivant</Button>
        </Grid>

        <Grid item xs={12}>
          <Card variant='outlined'>
            <CardContent>
              <Typography variant="h3" color="text.secondary">
                Favoris
              </Typography>
              <hr />
              {
                favorites.length > 0
                  ?
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {favorites.map((pokemon) => (
                      <Card variant='outlined'>
                        <CardContent>
                          <Typography variant="h3" color="text.secondary" style={{ textAlign: 'center' }}>
                            {`${capitalizeFirstLetter(pokemon.name)}`}
                          </Typography>
                          <hr />
                          <div style={{ textAlign: 'center' }}>
                            <img src={pokemon.sprites.front_default} />
                            <img src={pokemon.sprites.back_default} />
                          </div>

                          <Typography variant="body1">
                            Types :
                          </Typography>
                          <ul>
                            {
                              pokemon.types.map((typeEntry) => (
                                <li>
                                  <Typography variant="body2">{typeEntry.type.name}</Typography>
                                </li>
                              ))
                            }
                          </ul>

                          <hr />
                          <div style={{ display: 'inline-flex', gap: '10px' }}>
                            <Button onClick={() => removeFromFavorites(pokemon)} color="error" variant="contained">Retirer des favoris</Button>
                            <Button onClick={() => showEditDialog(pokemon)} color="warning" variant="outlined">Modifier</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                    }
                  </div>
                  :
                  <Typography variant='body1'>
                    Aucun favoris
                  </Typography>
              }
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {
            pokemons.length > 0
              ?
              pokemons.map((pokemon) => (
                <Card onClick={() => getPokemonDetails(pokemon.url)} variant='outlined' sx={{ maxWidth: 275 }} style={{ cursor: 'pointer' }}>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" style={{ textAlign: 'center' }}>
                      {capitalizeFirstLetter(pokemon.name)}
                    </Typography>
                    <img src={getPokemonImage(pokemon.url)} />
                  </CardContent>
                </Card>
              ))
              :
              <>
                <p>Aucun pokémon trouvé</p>
              </>
          }
        </Grid>
        <Grid item xs={6}>
          {
            pokemonDetails
              ?
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant="h3" color="text.secondary">
                    {`${capitalizeFirstLetter(pokemonDetails.name)} (${pokemonDetails.id})`}
                  </Typography>
                  <hr />
                  <img src={pokemonDetails.sprites.front_default} />
                  <img src={pokemonDetails.sprites.back_default} />

                  <Typography variant="body1">
                    Types :
                  </Typography>
                  <ul>
                    {
                      pokemonDetails.types.map((typeEntry) => (
                        <li>
                          <Typography variant="body2">{typeEntry.type.name}</Typography>
                        </li>
                      ))
                    }
                  </ul>

                  <hr />
                  <Button onClick={() => addToFavorites(pokemonDetails)} variant="contained">Ajouter aux favoris</Button>
                </CardContent>
              </Card>
              :
              null
          }
        </Grid>
      </Grid >
    </>
  );
}

export default App;

function EditPokemonDialog(props) {
  const { onClose, pokemon, open } = props;
  const [name, setName] = useState("");

  const close = () => {
    onClose();
  };

  const savePokemon = () => {
    pokemon.name = name
    onClose(pokemon);
  }

  const handleChangeName = (event) => {
    setName(event.target.value);
  };

  return (
    <Dialog onClose={close} open={open}>
      {
        pokemon
          ?
          <>
            <DialogTitle variant='h4'>Modifier {pokemon.name}</DialogTitle>
            <DialogContent>
              <TextField style={{ margin: '10px' }} label="Nom du pokémon" variant="outlined" value={name} onChange={handleChangeName} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => savePokemon()} variant="contained" color='primary'>Modifier</Button>
              <Button onClick={() => close()} variant="outlined">Annuler</Button>
            </DialogActions>
          </>
          :
          null
      }
    </Dialog>
  );
}