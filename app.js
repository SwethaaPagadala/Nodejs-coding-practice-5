const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let db = null

const initialize = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initialize()

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
        select 
        movie_name 
        from 
        movie;`;
  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map((eachMovie) => ({movieName: eachMovie.movie_name})),
  )
})

app.get("/movies/:movieId/", async (request,response) =>{
  const {movieId} = request.params;
  const getMovieQuery =`
  select
  *
  from
  movie
  where
  movie_id = ${movieId};`;
const movie = await db.get(getMovieQuery);
response.send(convertMovieDbObjectToResponseObject(movie));
})

app.post("/movies/"async(request,response)=>{
  const {directorId,movieName,leadActor} = request.body;
  const postMovieQuery = `
  insert into
  movie(director_id,movie_name,lead_actor)
  values
  (${directorId},'${movieName}',${leadActor}');`;
  await db.run(postMovieQuery)
  response.send("Movie Successfully Added")
})

app.put("/movies/:movieId/",async (request,response) => {
  const {directorId, movieName, leadActor} = request.body;
  const {movieId} = request.params;
  const updateMovieQuery = `
  update
  movie
  set
  director_id = ${directorId},
  movie_name = '${movieName}'
  lead_actor = '${leadActor}'
  where
  movie_id = ${movieId};`;

  await db.run(updateMovieQuery)
  response.send("Movie details Updated");
})

app.delete("/movies/:movieId/", async (request,response) => {
const {movieId} = request.params;
const deleteMovieQuery = `
delete from
movie
where 
movie_id = ${movieId};`;
await db.run(deleteMovieQuery);
response.send("Movie Removed");
})

app.get("/directors/",async(request,response) => {
  const getDirectorsQuery = `
  select
  *
  from
  director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => 
    convertDirectorDbObjectToResponseObject(eachDirector)
    )
  )
})

app.get("directors/:directorId/movies/", async(request,response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
  select 
  movie_name
  from
  movie
  where
  director_id = '${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({movieName: eachMovie.moviename}))
  )
})
module.exports = app
