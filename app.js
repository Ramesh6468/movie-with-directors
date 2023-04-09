const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

const getmovienames = (each) => {
  return {
    movieName: each.movie_name,
  };
};

const getmovienameswithall = (each) => {
  return {
    movieId: each.movie_id,
    directorId: each.director_id,
    movieName: each.movie_name,
    leadActor: each.lead_actor,
  };
};

const getmovienameswithall2 = (each) => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Is Running");
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMovies = `
    SELECT movie_name
    FROM movie
    ORDER BY movie_id;
    
    `;
  const movieList = await db.all(getMovies);
  const result = movieList.map((each) => {
    return getmovienames(each);
  });
  response.send(result);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieDetails = `
    INSERT INTO 
    movie (director_id,movie_name,lead_actor)
    VALUES
    (${directorId},
    '${movieName}',
    '${leadActor}');
    `;
  await db.run(addMovieDetails);
  response.send("Movie Successfully Added");
  console.log(typeof directorId);
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviequary = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;

  const getresult = await db.get(moviequary);
  const result = getmovienameswithall(getresult);
  response.send(result);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateMovieDetails = request.body;

  const { directorId, movieName, leadActor } = updateMovieDetails;
  const changeMovieDetails = `
    UPDATE 
     movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};
    `;
  await db.run(changeMovieDetails);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE 
    FROM movie
    WHERE movie_id = ${movieId}`;

  await db.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getAllDirectors = `
    SELECT *
    FROM director
    ORDER BY director_id;
    
    `;
  const directorList = await db.all(getAllDirectors);
  const result = directorList.map((eachObject) => {
    return getmovienameswithall2(eachObject);
  });
  response.send(result);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllDirectorMovies = `
    SELECT movie_name
    FROM director JOIN movie 
    ON director.director_id = movie.director_id
    WHERE director.director_id = ${directorId};
    
    `;
  const moviesList = await db.all(getAllDirectorMovies);
  const result = moviesList.map((eachObject) => {
    return getmovienames(eachObject);
  });
  response.send(result);
});

module.exports = app;
