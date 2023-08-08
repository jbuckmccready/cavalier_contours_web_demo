use std::{net::SocketAddr, time::Duration};

use poem::{
    endpoint::StaticFilesEndpoint, get, handler, listener::TcpListener, middleware::Tracing,
    web::Path, EndpointExt, Route, Server,
};

#[handler]
fn hello(Path(name): Path<String>) -> String {
    format!("hello: {name}")
}

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "poem=debug");
    }
    tracing_subscriber::fmt::init();

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8000".into())
        .parse::<u16>()
        .expect("failed to parse $PORT to u16");

    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    // let page_dir = {
    //     let mut p = std::env::current_exe().expect("failed to get current executable path");
    //     p.pop();
    //     p.push("index");
    //     p
    // };

    // let app = Route::new()
    //     .nest(
    //         "/",
    //         StaticFilesEndpoint::new(page_dir).index_file("index.html"),
    //     )
    //     .with(Tracing);

    let app = Route::new().at("/hello/:name", get(hello)).with(Tracing);

    Server::new(TcpListener::bind(addr))
        .run_with_graceful_shutdown(
            app,
            async move {
                let _ = tokio::signal::ctrl_c().await;
            },
            Some(Duration::from_secs(5)),
        )
        .await
}
