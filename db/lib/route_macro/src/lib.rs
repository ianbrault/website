/*
** route_macro/src/lib.rs
*/

use proc_macro::TokenStream;
use quote::{ToTokens, quote};
use syn::{
    Expr, FnArg, GenericArgument, Ident, ItemFn, PathArguments, ReturnType, Signature, Token, Type,
    TypePath, parse_macro_input, punctuated::Punctuated,
};

fn extract_result_type(ast_type: &Type) -> Box<Type> {
    match ast_type {
        Type::Path(TypePath { qself: _, path }) => {
            // Find the segment with the angle bracket arguments
            for segment in path.segments.iter() {
                if segment.ident == "Result" {
                    match &segment.arguments {
                        PathArguments::AngleBracketed(args) => match &args.args[0] {
                            GenericArgument::Type(t) => {
                                return Box::new(t.clone());
                            }
                            _ => panic!("Invalid Result argument: {:?}", &args.args[0]),
                        },
                        _ => panic!("Invalid Result type arguments: {:?}", segment.arguments),
                    }
                }
            }
            panic!("Invalid return type: {:?}", ast_type);
        }
        _ => panic!("Invalid return type: {:?}", ast_type),
    }
}

fn extract_function_arguments(signature: &Signature) -> Punctuated<Expr, Token![,]> {
    let mut arg_exprs = Vec::new();
    for arg in signature.inputs.iter() {
        if let FnArg::Typed(pat) = arg {
            let pat_arg = &pat.pat;
            let tokens = quote! { #pat_arg }.into_token_stream();
            arg_exprs.push(Expr::Verbatim(tokens));
        }
    }
    arg_exprs.into_iter().collect()
}

fn get_outer_signature(signature: &Signature) -> Signature {
    // The outer signature should be the same as the original but the return type should be the Ok
    // variant type as extracted from the original signature
    let mut outer = signature.clone();
    // Expects the return type to be a Result
    outer.output = match &signature.output {
        ReturnType::Default => panic!("Function must have a Result return type"),
        ReturnType::Type(token, ast_type) => {
            ReturnType::Type(*token, extract_result_type(ast_type))
        }
    };
    outer
}

fn get_inner_signature(signature: &Signature) -> Signature {
    // The inner signature should be the same as the original but renamed
    let mut inner = signature.clone();
    let inner_name = format!("{}_inner", signature.ident);
    inner.ident = Ident::new(&inner_name, signature.ident.span());
    inner
}

#[proc_macro_attribute]
pub fn route(_: TokenStream, item: TokenStream) -> TokenStream {
    // Parse the attributed function into its AST representation
    let ast = parse_macro_input!(item as ItemFn);
    let attrs = ast.attrs;
    let vis = ast.vis;
    let body = ast.block;

    let outer_signature = get_outer_signature(&ast.sig);
    let inner_signature = get_inner_signature(&ast.sig);
    let inner_ident = &inner_signature.ident;
    let inner_args = extract_function_arguments(&ast.sig);

    let match_expr = if ast.sig.asyncness.is_some() {
        quote! { match #inner_ident(#inner_args).await }
    } else {
        quote! { match #inner_ident(#inner_args) }
    };
    let match_body = quote! {
        Ok(response) => response,
        Err(error) => {
            log::error!("Error: {}", error.to_string());
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                error.to_string()
            )
            .into_response()
        }
    };

    quote! {
        #(#attrs)*
        #vis
        #outer_signature {
            #inner_signature
            #body
            #match_expr {
                #match_body
            }
        }
    }
    .into()
}
