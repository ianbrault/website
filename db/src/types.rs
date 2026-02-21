/*
** db/src/types.rs
*/

use serde::{Deserialize, Serialize};

use std::fmt::Debug;

/// Fixed-size, zero-allocation circular buffer
#[derive(Deserialize, Serialize)]
pub struct CircularBuffer<T> {
    data: Vec<Option<T>>,
    index: usize,
}

impl<T> CircularBuffer<T> {
    pub fn new(size: usize) -> Self
    where
        T: Clone,
    {
        Self {
            data: vec![None; size],
            index: 0,
        }
    }

    pub fn push(&mut self, item: T) {
        self.data[self.index] = Some(item);
        self.index = (self.index + 1) % self.data.len()
    }
}

impl<T> Clone for CircularBuffer<T>
where
    T: Clone,
{
    fn clone(&self) -> Self {
        Self {
            data: self.data.clone(),
            index: self.index,
        }
    }
}

impl<T> Debug for CircularBuffer<T>
where
    T: Debug,
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "CircularBuffer {{ data: {:?}, index: {} }}",
            self.data, self.index
        )
    }
}
