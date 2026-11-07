/*
** route_macro/tests/test_macro.rs
*/

use route_macro::route;

pub mod axum {
    pub mod http {
        pub enum StatusCode {
            #[allow(non_camel_case_types)]
            INTERNAL_SERVER_ERROR = 500,
        }
    }
}

#[derive(Debug, PartialEq)]
pub struct Response(usize);

pub trait IntoResponse {
    fn into_response(self) -> Response;
}

impl IntoResponse for (axum::http::StatusCode, String) {
    fn into_response(self) -> Response {
        let (status_code, _) = self;
        Response(status_code as usize)
    }
}

#[test]
fn test_route() {
    #[route]
    /// A function to test our macro
    pub fn route_tester(foo: usize) -> Result<Response, String> {
        if foo % 2 == 0 {
            Ok(Response(foo + 123))
        } else {
            Err("oh no".to_string())
        }
    }
    assert_eq!(route_tester(20), Response(143));
    assert_eq!(route_tester(1), Response(500));
}

#[test]
fn test_route_anyhow() {
    mod anyhow {
        pub type Result<T> = std::result::Result<T, String>;
    }
    #[route]
    fn route_tester(foo: usize, bar: usize) -> anyhow::Result<Response> {
        Ok(Response(foo + bar))
    }
    assert_eq!(route_tester(32, 64), Response(96));
}

#[test]
fn test_route_complex_arg_type() {
    struct Json(usize);
    #[route]
    pub fn route_tester(Json(j): Json) -> Result<Response, String> {
        Ok(Response(j))
    }
    assert_eq!(route_tester(Json(0)), Response(0));
}

#[test]
fn test_route_async() {
    #[route]
    async fn route_tester(foo: usize) -> Result<Response, String> {
        Ok(Response(foo))
    }
}

