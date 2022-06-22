import React, { Component, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import LinearProgress from '@mui/material/LinearProgress';

import './styles/App.css';
import { width } from '@mui/system';
import { ListItem, ListItemButton, ListItemText } from '@mui/material';


function App(props) {
  const [pokemons, setPokemons] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [currentPageUrl, setCurrentPageUrl] = useState("https://pokeapi.co/api/v2/pokemon?offset=0&limit=20");
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([])

  function capitalizeFirstLetter(string) {
    if (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }

  useEffect(() => {
    getPokemons()
    loadStorage()
  }, []);

  const getPokemons = () => {
    setLoading(true)
    fetch(currentPageUrl)
      .then(response => response.json())
      .then(data => {
        setPokemons(data.results)
      }).finally(() => {
        setLoading(false)
      })
  }

  const getPokemonImage = (url) => {
    const id = getPokemonId(url)
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
  }

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

  const getPokemonId = (url) => {
    const pokemonUrlSplit = url.split('/')
    const pokemonId = pokemonUrlSplit[pokemonUrlSplit.length - 2]
    return pokemonId
  }

  const nextPage = () => {
    const newIndex = pageIndex + 20
    setPageIndex(newIndex)
    setCurrentPageUrl(`https://pokeapi.co/api/v2/pokemon?offset=${newIndex}&limit=20`)
    getPokemons()
  }

  const previousPage = () => {
    const newIndex = pageIndex - 20
    setPageIndex(newIndex);
    setCurrentPageUrl(`https://pokeapi.co/api/v2/pokemon?offset=${newIndex}&limit=20`)
    getPokemons()
  }

  const addToFavorites = (pokemon) => {
    favorites.push(pokemon)
    saveStorage()
    loadStorage()
  }

  const removeFromFavorites = (pokemon) => {
    favorites.pop(pokemon)
    saveStorage()
    loadStorage()
  }

  const loadStorage = () => {
    const favs = JSON.parse(localStorage.getItem('favorites')) || []
    console.log(favs)
    setFavorites(favs)
  }

  const saveStorage = () => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {
          Loading ? <LinearProgress /> : null
        }
      </Grid>
      <Grid item xs={12} style={{ display: 'inline-flex', gap: '10px' }}>
        <Button onClick={() => previousPage()} variant="outlined">Précédent</Button>
        <Button onClick={() => nextPage()} variant="outlined">Suivant</Button>
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '90vh', overflow: 'auto' }}>
                  {favorites.map((pokemon) => (
                    <Card variant='outlined'>
                      <CardContent>
                        <Typography variant="h3" color="text.secondary">
                          {`${capitalizeFirstLetter(pokemon.name)} (${pokemon.id})`}
                        </Typography>
                        <hr />
                        <img src={pokemon.sprites.front_default} />
                        <img src={pokemon.sprites.back_default} />

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
                        <Button onClick={() => removeFromFavorites(pokemon)} color="error" variant="contained">Retirer des favoris</Button>
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

      <Grid item xs={6} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxHeight: '90vh', overflow: 'auto' }}>
        {
          pokemons.length > 0
            ?
            pokemons.map((pokemon) => (
              <Card onClick={() => getPokemonDetails(pokemon.url)} variant='outlined' sx={{ maxWidth: 275 }} style={{ cursor: 'pointer' }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
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
      <Grid item xs={6} style={{ maxHeight: '90vh', overflow: 'auto' }}>
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
  );
}

export default App;