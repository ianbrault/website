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

    pub fn iter(&self) -> impl Iterator<Item = &T> {
        // First iterate from the index to the end of the buffer then loop around and iterate from
        // the start of the buffer up to the index
        let a = self.data[self.index..].iter().filter_map(|x| x.as_ref());
        let b = self.data[..self.index].iter().filter_map(|x| x.as_ref());
        a.chain(b)
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
        // FIXME: debug output should exclude the massive amount of None's in the data
        write!(
            f,
            "CircularBuffer {{ data: {:?}, index: {} }}",
            self.data, self.index
        )
    }
}
