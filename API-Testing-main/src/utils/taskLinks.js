/**
 * Utility functions for generating HATEOAS links for Task resources and collection endpoints.
 */

/**
 * Generates status-aware HATEOAS links for an individual task document.
 * 
 * @param {Object} task - Mongoose task document or plain JS object
 * @param {Object} [options] - Additional options (e.g. { includeCollection: true })
 * @returns {Object} HATEOAS _links mapping
 */
function generateTaskLinks(task, options = {}) {
  const id = task._id ? task._id.toString() : task.id;
  const status = task.status || (task.completed ? 'completed' : 'pending');

  const links = {
    self: {
      href: `/tasks/${id}`,
      method: 'GET'
    },
    update: {
      href: `/tasks/${id}`,
      method: 'PUT'
    },
    partialUpdate: {
      href: `/tasks/${id}`,
      method: 'PATCH'
    }
  };

  // Status-aware hypermedia controls
  if (status === 'pending') {
    links.start = {
      href: `/tasks/${id}`,
      method: 'PATCH'
    };
  } else if (status === 'in-progress') {
    links.complete = {
      href: `/tasks/${id}`,
      method: 'PATCH'
    };
  }

  links.delete = {
    href: `/tasks/${id}`,
    method: 'DELETE'
  };

  if (options.includeCollection !== false) {
    links.collection = {
      href: '/tasks',
      method: 'GET'
    };
  }

  return links;
}

/**
 * Generates collection-level and pagination HATEOAS links for GET /tasks.
 * 
 * @param {Object} reqQuery - Request query object (e.g. req.query)
 * @param {number} page - Current page number
 * @param {number} limit - Items per page limit
 * @param {number} totalPages - Total available pages
 * @returns {Object} HATEOAS collection _links mapping
 */
function generateCollectionLinks(reqQuery = {}, page = 1, limit = 10, totalPages = 1) {
  const buildUrl = (targetPage) => {
    const params = new URLSearchParams();

    // Preserve search and filter query parameters
    if (reqQuery.search) params.set('search', reqQuery.search);
    if (reqQuery.status) params.set('status', reqQuery.status);
    if (reqQuery.completed !== undefined) params.set('completed', reqQuery.completed);
    if (reqQuery.priority) params.set('priority', reqQuery.priority);

    params.set('page', targetPage);
    params.set('limit', limit);

    return `/tasks?${params.toString()}`;
  };

  const links = {
    self: {
      href: buildUrl(page),
      method: 'GET'
    },
    first: {
      href: buildUrl(1),
      method: 'GET'
    }
  };

  if (page > 1 && page <= totalPages + 1) {
    links.previous = {
      href: buildUrl(page - 1),
      method: 'GET'
    };
  }

  if (page < totalPages) {
    links.next = {
      href: buildUrl(page + 1),
      method: 'GET'
    };
  }

  links.last = {
    href: buildUrl(totalPages > 0 ? totalPages : 1),
    method: 'GET'
  };

  links.create = {
    href: '/tasks',
    method: 'POST'
  };

  return links;
}

module.exports = {
  generateTaskLinks,
  generateCollectionLinks
};
